"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy.exc import NoResultFound
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, Service, Gallery
from .models import Order, OrderServiceItem, OrderProductItem

api = Blueprint('api', __name__)

CORS(api)
# Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({
        "message": "¡Hola! Soy la API de Barbería Godfather 🚀"
    }), 200

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# signup, private token, user

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# Registro de usuarios (clientes o admins)


@api.route('/signup', methods=['POST'])
def signup_user():
    body = request.get_json()

    name = body.get("name")
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    try:
        new_user = User(email=email, username=name)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Usuario creado correctamente"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "El usuario ya existe"}), 409

# Ruta protegida (solo usuarios autenticados)


@api.route('/private', methods=['GET'])
@jwt_required()
def private_area():
    user_id = get_jwt_identity()
    return jsonify({
        "message": f"Bienvenido, usuario #{user_id}. Has accedido a una ruta protegida."
    }), 200

# Login (crea token JWT)


@api.route('/login', methods=['POST'])
def login_user():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    # Validar que se recibió email y password
    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    # Buscar usuario por email
    user = User.query.filter_by(email=email).first()

    # Verificar si existe y si la contraseña es correcta
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    # Crear token JWT con el ID del usuario
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "msg": "Login exitoso",
        "token": access_token,
        "user_id": user.id,
        "name": user.username
    }), 200


# Información del usuario autenticado
@api.route('/user', methods=['GET'])
@jwt_required()
def get_user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    user_info = {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
    }

    return jsonify(user_info), 200

# Obtener todos los usuarios (solo para admins)


@api.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Acceso denegado"}), 403

    users = User.query.all()
    users_list = [{"id": user.id, "email": user.email,
                   "is_active": user.is_active} for user in users]

    return jsonify(users_list), 200

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# services

# //////////////////////////////////////////////////////////////////////////////////////////////////////////////


# Obtener todos los servicios (público)
@api.route('/services', methods=['GET'])
def get_services():
    services = Service.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in services]), 200

# Obtener un servicio por ID (público)
@api.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404
    return jsonify(service.to_dict()), 200

# Crear un servicio (sólo admin)
@api.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    name = data.get("name")
    price = data.get("price")
    if not name or not price:
        return jsonify({"error": "Nombre y precio son obligatorios"}), 400

    new_service = Service(
        name=name,
        description=data.get("description"),
        price=price,
        duration=data.get("duration"),
        image_url=data.get("image_url")
    )
    db.session.add(new_service)
    db.session.commit()
    return jsonify(new_service.to_dict()), 201

# Actualizar un servicio por ID (sólo admin)
@api.route('/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404

    data = request.get_json()
    service.name = data.get("name", service.name)
    service.description = data.get("description", service.description)
    service.price = data.get("price", service.price)
    service.duration = data.get("duration", service.duration)
    service.image_url = data.get("image_url", service.image_url)
    db.session.commit()
    return jsonify(service.to_dict()), 200

# Eliminar un servicio por ID (sólo admin)
@api.route('/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404

    db.session.delete(service)
    db.session.commit()
    return jsonify({"msg": "Servicio eliminado correctamente"}), 200

# ////////////////////////////////////////////////////////////////////////////////////////////////

# Orders

# ////////////////////////////////////////////////////////////////////////////////////////////////

@api.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()

    # Recoge la información del cliente
    customer_name = data.get('customer_name')
    customer_email = data.get('customer_email')
    services = data.get('services', [])
    products = data.get('products', [])

    if not customer_name or not customer_email:
        return jsonify({"error": "Nombre y correo son obligatorios"}), 400

    # Crea la orden
    new_order = Order(
        customer_name=customer_name,
        customer_email=customer_email
    )
    db.session.add(new_order)
    db.session.flush()  # Necesario para obtener el id antes de agregar los items

    # Agrega servicios a la orden
    for s in services:
        order_service_item = OrderServiceItem(
            order_id=new_order.id,
            service_id=s['service_id'],
            service_name=s['service_name'],
            price=s['price']
        )
        db.session.add(order_service_item)

    # Agrega productos a la orden
    for p in products:
        order_product_item = OrderProductItem(
            order_id=new_order.id,
            product_id=p['product_id'],
            product_name=p['product_name'],
            price=p['price'],
            quantity=p.get('quantity', 1)
        )
        db.session.add(order_product_item)

    db.session.commit()
    return jsonify(new_order.to_dict()), 201

# ////////////////

# gallery

# //////////////


@api.route('/gallery', methods=['GET'])
def get_gallery():
    gallery_items = Gallery.query.all()
    gallery_list = [item.to_dict() for item in gallery_items]
    return jsonify(gallery_list), 200


def is_admin_user(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin


@api.route('/gallery', methods=['POST'])
@jwt_required()
def add_photo():
    user_id = get_jwt_identity()
    if not is_admin_user(user_id):
        return jsonify({"msg": "Solo los administradores pueden agregar fotos"}), 403

    body = request.get_json()
    image_url = body.get('image_url')
    title = body.get('title')
    description = body.get('description')
    category = body.get('category')
    is_featured = body.get('is_featured', False)

    if not image_url:
        return jsonify({"msg": "La URL de la imagen es obligatoria"}), 400

    new_photo = Gallery(
        image_url=image_url,
        title=title,
        description=description,
        category=category,
        is_featured=is_featured
    )
    db.session.add(new_photo)
    db.session.commit()
    return jsonify(new_photo.to_dict()), 201


@api.route('/gallery/<int:photo_id>', methods=['PUT'])
@jwt_required()
def edit_photo(photo_id):
    user_id = get_jwt_identity()
    if not is_admin_user(user_id):
        return jsonify({"msg": "Solo los administradores pueden editar fotos"}), 403

    photo = Gallery.query.get(photo_id)
    if not photo:
        return jsonify({"msg": "Foto no encontrada"}), 404

    body = request.get_json()
    photo.image_url = body.get('image_url', photo.image_url)
    photo.title = body.get('title', photo.title)
    photo.description = body.get('description', photo.description)
    photo.category = body.get('category', photo.category)
    photo.is_featured = body.get('is_featured', photo.is_featured)

    db.session.commit()
    return jsonify(photo.to_dict()), 200


@api.route('/gallery/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_photo(photo_id):
    user_id = get_jwt_identity()
    if not is_admin_user(user_id):
        return jsonify({"msg": "Solo los administradores pueden eliminar fotos"}), 403

    photo = Gallery.query.get(photo_id)
    if not photo:
        return jsonify({"msg": "Foto no encontrada"}), 404

    db.session.delete(photo)
    db.session.commit()
    return jsonify({"msg": "Foto eliminada"}), 200

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

api = Blueprint('api', __name__)

CORS(api)
# Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({
        "message": "¡Hola! Soy la API de Barbería Godfather 🚀"
    }), 200

# ////////////////////////////

# signup, private token, user

# ///////////////////////////

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

# ////////////////

# services

# //////////////


@api.route('/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    services_list = [service.to_dict() for service in services]
    return jsonify(services_list), 200


@api.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404
    return jsonify(service.to_dict()), 200


@api.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Acceso denegado"}), 403

    body = request.get_json()
    name = body.get("name")
    description = body.get("description")
    price = body.get("price")
    duration = body.get("duration")
    image_url = body.get("image_url")

    if not name or not price:
        return jsonify({"error": "Nombre y precio son obligatorios"}), 400

    new_service = Service(
        name=name,
        description=description,
        price=price,
        duration=duration,
        image_url=image_url
    )

    db.session.add(new_service)
    db.session.commit()

    return jsonify(new_service.to_dict()), 201


@api.route('/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Acceso denegado"}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404

    body = request.get_json()
    service.name = body.get("name", service.name)
    service.description = body.get("description", service.description)
    service.price = body.get("price", service.price)
    service.duration = body.get("duration", service.duration)
    service.image_url = body.get("image_url", service.image_url)

    db.session.commit()

    return jsonify(service.to_dict()), 200


@api.route('/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Acceso denegado"}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404

    db.session.delete(service)
    db.session.commit()

    return jsonify({"msg": "Servicio eliminado correctamente"}), 200

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

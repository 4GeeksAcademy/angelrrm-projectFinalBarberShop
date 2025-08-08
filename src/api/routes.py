"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy.exc import NoResultFound
from api.models import db, User, Service, CartItem, Products
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, Service
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

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# Carrito de compras (Shopping Cart)

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# Obtener el carrito del usuario autenticado
@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200

# Añadir producto al carrito
@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id or quantity <= 0:
        return jsonify({"error": "Producto y cantidad son obligatorios"}), 400

    # Verifica si el producto existe
    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no existe"}), 404

    # Verifica si el producto ya está en el carrito
    existing_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing_item:
        existing_item.quantity += quantity
    else:
        new_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(new_item)

    db.session.commit()

    # Devuelve el carrito actualizado
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 201

# Actualizar cantidad de un producto en el carrito
@api.route('/cart/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    new_quantity = data.get('quantity')

    if not isinstance(new_quantity, int) or new_quantity < 1:
        return jsonify({"error": "Cantidad inválida"}), 400

    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Item no encontrado en el carrito"}), 404

    item.quantity = new_quantity
    db.session.commit()

    # Devuelve el carrito actualizado
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200

# Eliminar producto del carrito
@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({"error": "Item no encontrado en el carrito"}), 404

    db.session.delete(item)
    db.session.commit()

    # Devuelve el carrito actualizado
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200

# Checkout del carrito (vaciar y "comprar")
@api.route('/cart/checkout', methods=['POST'])
@jwt_required()
def checkout_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"error": "El carrito está vacío"}), 400

    # Aquí podrías procesar el pago y crear una orden
    # Por simplicidad, solo eliminamos los items del carrito
    for item in cart_items:
        db.session.delete(item)

    db.session.commit()
    return jsonify({"msg": "Compra realizada con éxito"}), 200

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# Products

# //////////////////////////////////////////////////////////////////////////////////////////////////////////////

# Obtener todos los productos (público)
@api.route('/products', methods=['GET'])
def get_products():
    products = Products.query.all()
    return jsonify([p.to_dict() for p in products]), 200

# Obtener un producto por ID (público)
@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(product.to_dict()), 200

# Crear un producto (solo admin)
@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    name = data.get("name")
    brand = data.get("brand")
    type_ = data.get("type")
    description = data.get("description")
    price = data.get("price")
    image_url = data.get("image_url")

    if not name or not brand or not price:
        return jsonify({"error": "Nombre, marca y precio son obligatorios"}), 400

    new_product = Products(
        name=name,
        brand=brand,
        type=type_,
        description=description,
        price=price,
        image_url=image_url
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.to_dict()), 201

# Actualizar un producto (solo admin)
@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json()
    product.name = data.get("name", product.name)
    product.brand = data.get("brand", product.brand)
    product.type = data.get("type", product.type)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify(product.to_dict()), 200

# Eliminar un producto (solo admin)
@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"msg": "Producto eliminado correctamente"}), 200
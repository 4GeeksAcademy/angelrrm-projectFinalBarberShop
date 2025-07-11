"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

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
        new_user = User(email=email, username=name, is_active=True)
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
@api.route('/token', methods=['POST'])
def create_token():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id}), 200

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
    users_list = [{"id": user.id, "email": user.email, "is_active": user.is_active} for user in users]

    return jsonify(users_list), 200

#////////////////

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
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

# Registro de usuarios (clientes o admins/barberos)
@api.route('/signup', methods=['POST'])
def signup_user():
    body = request.get_json()

    email = body.get("email")
    password = body.get("password")
    # Puedes agregar: name, phone, role, etc.

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    try:
        new_user = User(email=email, password=password, is_active=True)
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

    user = User.query.filter_by(email=email, password=password).first()

    if user is None:
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id}), 200

# Ruta para obtener información del usuario autenticado
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
        # Puedes agregar más campos según tu modelo User
    }

    return jsonify(user_info), 200

# Ruta para obtener todos los usuarios (solo para admins)
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
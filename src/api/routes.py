"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy.exc import NoResultFound
from api.models import db, User, Service, CartItem, Products, Order, OrderProductItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import stripe, os


api = Blueprint('api', __name__)

CORS(api)
# Allow CORS requests to this API
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

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


@api.route('/login', methods=['POST'])
def login_user():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "msg": "Login exitoso",
        "token": access_token,
        "user_id": user.id,
        "name": user.username
    }), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def private_area():
    user_id = get_jwt_identity()
    return jsonify({
        "message": f"Bienvenido, usuario #{user_id}. Has accedido a una ruta protegida."
    }), 200


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

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# SERVICES

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@api.route('/services', methods=['GET'])
def get_services():
    services = Service.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in services]), 200


@api.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404
    return jsonify(service.to_dict()), 200


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

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# PRODUCTS

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@api.route('/products', methods=['GET'])
def get_products():
    products = Products.query.all()
    return jsonify([p.to_dict() for p in products]), 200


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(product.to_dict()), 200


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
    stock = data.get("stock", 0)

    if not name or not brand or not price:
        return jsonify({"error": "Nombre, marca y precio son obligatorios"}), 400

    new_product = Products(
        name=name,
        brand=brand,
        type=type_,
        description=description,
        price=price,
        stock=stock,
        image_url=image_url
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.to_dict()), 201


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
    product.stock = data.get("stock", product.stock)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify(product.to_dict()), 200


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

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# SHOPPING CART

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200


@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    print(
        f"🐛 DEBUG: user_id={user_id}, product_id={product_id}, quantity={quantity}")

    if not product_id or quantity <= 0:
        return jsonify({"error": "Producto y cantidad son obligatorios"}), 400

    # Check if the product exists
    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no existe"}), 404

    print(
        f"🐛 DEBUG: Producto encontrado: {product.name}, stock: {product.stock}")

    # Stock validation (if the product has defined stock)
    if hasattr(product, 'stock') and product.stock is not None and product.stock < quantity:
        return jsonify({
            "error": f"Stock insuficiente. Solo quedan {product.stock} unidades"
        }), 400

    # Check if the product is already in the cart
    existing_item = CartItem.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first()

    if existing_item:
        print(
            f"🐛 DEBUG: Item existente, cantidad actual: {existing_item.quantity}")
        # Validate total stock with the new quantity
        new_total = existing_item.quantity + quantity
        if (hasattr(product, 'stock') and product.stock is not None and
                product.stock < new_total):
            return jsonify({
                "error": f"Stock insuficiente. Solo quedan {product.stock} unidades"
            }), 400
        existing_item.quantity = new_total
    else:
        print(f"🐛 DEBUG: Creando nuevo item en carrito")
        new_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(new_item)

    try:
        db.session.commit()
        print(f"🐛 DEBUG: Item añadido al carrito exitosamente")
    except Exception as e:
        print(f"🐛 DEBUG: Error al guardar: {e}")
        db.session.rollback()
        return jsonify({"error": "Error al añadir al carrito"}), 500

    # Return the updated cart
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 201


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

    # Validate stock before updating (if it exists)
    if (item.product and hasattr(item.product, 'stock') and
            item.product.stock is not None and item.product.stock < new_quantity):
        return jsonify({
            "error": f"Stock insuficiente. Solo quedan {item.product.stock} unidades"
        }), 400

    item.quantity = new_quantity
    db.session.commit()

    # Return the updated cart
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200


@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({"error": "Item no encontrado en el carrito"}), 404

    db.session.delete(item)
    db.session.commit()

    # Return the updated cart
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items]), 200


@api.route('/cart/checkout', methods=['POST'])
@jwt_required()
def checkout_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"error": "El carrito está vacío"}), 400

    try:
        # Calculate total
        total_price = 0
        for item in cart_items:
            if item.product:
                total_price += float(item.product.price) * item.quantity

        # Create the order
        new_order = Order(
            user_id=user_id,
            total_price=total_price,
            status='confirmed'
        )
        db.session.add(new_order)
        db.session.flush()  # To obtain the order ID

        # Create order items
        for item in cart_items:
            if item.product:
                order_item = OrderProductItem(
                    order_id=new_order.id,
                    product_id=item.product_id,
                    product_name=item.product.name,
                    price=float(item.product.price),
                    quantity=item.quantity
                )
                db.session.add(order_item)

                # Update product stock (if it exists)
                if (hasattr(item.product, 'stock') and item.product.stock is not None and
                        item.product.stock >= item.quantity):
                    item.product.stock -= item.quantity

        # Vaciar el carrito
        for item in cart_items:
            db.session.delete(item)

        db.session.commit()

        return jsonify({
            "msg": "Compra realizada con éxito",
            "order_id": new_order.id,
            "total": total_price
        }), 200

    except Exception as e:
        print(f"🐛 DEBUG: Error en checkout: {e}")
        db.session.rollback()
        return jsonify({"error": "Error al procesar la compra"}), 500

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# ORDERS

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@api.route('/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(
        Order.created_at.desc()
    ).all()

    orders_data = []
    for order in orders:
        order_items = OrderProductItem.query.filter_by(order_id=order.id).all()
        orders_data.append({
            **order.to_dict(),
            'items': [item.to_dict() for item in order_items]
        })

    return jsonify(orders_data), 200

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# ADMIN UTILITIES & SEARCH

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@api.route('/products/search', methods=['GET'])
def search_products():
    brand = request.args.get('brand')
    product_type = request.args.get('type')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = Products.query

    if brand:
        query = query.filter(Products.brand.ilike(f'%{brand}%'))

    if product_type:
        query = query.filter(Products.type.ilike(f'%{product_type}%'))

    if min_price is not None:
        query = query.filter(Products.price >= min_price)

    if max_price is not None:
        query = query.filter(Products.price <= max_price)

    products = query.all()
    return jsonify([p.to_dict() for p in products]), 200


@api.route('/products/<int:product_id>/stock', methods=['PUT'])
@jwt_required()
def update_product_stock(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "No autorizado"}), 403

    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json()
    new_stock = data.get('stock')

    if new_stock is None or new_stock < 0:
        return jsonify({"error": "Stock inválido"}), 400

    product.stock = new_stock
    db.session.commit()

    return jsonify({
        "msg": "Stock actualizado correctamente",
        "product": product.to_dict()
    }), 200

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# DEBUG ENDPOINTS

# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@api.route('/debug/routes', methods=['GET'])
def debug_routes():
    """Endpoint para debuggear rutas registradas"""
    from flask import current_app
    routes = []
    for rule in current_app.url_map.iter_rules():
        if str(rule).startswith('/api'):
            routes.append({
                'endpoint': str(rule),
                'methods': list(rule.methods),
                'function': rule.endpoint
            })
    return jsonify(routes), 200


@api.route('/debug/cart/<int:user_id>', methods=['GET'])
@jwt_required()
def debug_user_cart(user_id):
    """Endpoint para debuggear el carrito de un usuario específico"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    # Only admins can see other users' carts.
    if not current_user.is_admin and current_user_id != user_id:
        return jsonify({"error": "No autorizado"}), 403

    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    debug_info = {
        'user_id': user_id,
        'cart_items_count': len(cart_items),
        'cart_items': [item.to_dict() for item in cart_items],
        'total_items': sum(item.quantity for item in cart_items),
        'total_price': sum(float(item.product.price) * item.quantity for item in cart_items if item.product)
    }

    return jsonify(debug_info), 200

@api.route('/create-payment', methods=["POST"])
def create_payment():
    response_body = {}
    try:
        data = request.json
        intent = stripe.PaymentIntent.create(
            amount=data["amount"], currency=data["currency"], automatic_payment_methods={'enabled': True})

        response_body["client_secret"] = intent["client_secret"]
        return response_body, 200
    except Exception as e:
        response_body["success"] = False
        response_body["error"] = str(e)
        return response_body, 403
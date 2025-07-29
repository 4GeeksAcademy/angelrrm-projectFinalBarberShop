from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///barbershop.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(500), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
        }


class Products(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'stock': self.stock,
            'category': self.category,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration = db.Column(db.Integer)
    image_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'duration': self.duration,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class OrderServiceItem(db.Model):
    __tablename__ = 'order_service_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    service_name = db.Column(db.String(100))
    price = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'service_id': self.service_id,
            'service_name': self.service_name,
            'price': self.price
        }   
    
    

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_price': self.total_price,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class OrderProductItem(db.Model):
    __tablename__ = 'order_product_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(100))
    price = db.Column(db.Float)
    quantity = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'price': self.price,
            'quantity': self.quantity
        }   
    


class Gallery(db.Model):
    __tablename__ = 'gallery'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50))
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'category': self.category,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat()
        }


class BarbershopInfo(db.Model):
    __tablename__ = 'barbershop_info'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    google_maps_url = db.Column(db.Text)
    boosky_url = db.Column(db.Text)
    instagram_url = db.Column(db.String(255))
    facebook_url = db.Column(db.String(255))
    hours_monday = db.Column(db.String(50))
    hours_tuesday = db.Column(db.String(50))
    hours_wednesday = db.Column(db.String(50))
    hours_thursday = db.Column(db.String(50))
    hours_friday = db.Column(db.String(50))
    hours_saturday = db.Column(db.String(50))
    hours_sunday = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'google_maps_url': self.google_maps_url,
            'boosky_url': self.boosky_url,
            'instagram_url': self.instagram_url,
            'facebook_url': self.facebook_url,
            'hours_monday': self.hours_monday,
            'hours_tuesday': self.hours_tuesday,
            'hours_wednesday': self.hours_wednesday,
            'hours_thursday': self.hours_thursday,
            'hours_friday': self.hours_friday,
            'hours_saturday': self.hours_saturday,
            'hours_sunday': self.hours_sunday,
        }

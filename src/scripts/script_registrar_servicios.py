# Script para registrar servicios iniciales en la base de datos (Flask shell o ejecutando como script)
from api.models import db, Service
from flask import Flask
import os
from dotenv import load_dotenv

# Cargar las variables de entorno
load_dotenv()
# Configuración de la aplicación Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///barbershop.db').replace("postgres://", "postgresql://")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

servicios_data = [
    {
        "name": "Corte de Cabello",
        "description": "Corte personalizado según tu estilo, realizado por barberos expertos.",
        "price": 20,
        "duration": 30,
        "image_url": "https://i.pinimg.com/736x/02/82/d0/0282d032df8a7e776f886c075da596ad.jpg"
    },
    {
        "name": "Corte de Barba",
        "description": "Modelado y perfilado profesional para tu barba, usando técnicas precisas y productos de alta calidad.",
        "price": 15,
        "duration": 20,
        "image_url": "https://i.pinimg.com/1200x/91/d6/03/91d6037c183ccc9644cdd59a70857524.jpg"
    },
    {
        "name": "Corte para Niños",
        "description": "Un ambiente divertido y relajado donde los más pequeños disfrutan de un corte diseñado especialmente para ellos.",
        "price": 12,
        "duration": 25,
        "image_url": "https://i.pinimg.com/1200x/ee/43/88/ee4388d7c977c41b02a4cacb5f8638a2.jpg"
    },
    {
        "name": "Afeitado Degradado",
        "description": "Logra un acabado impecable y definido con nuestro afeitado degradado, perfecto para un look sofisticado y moderno.",
        "price": 18,
        "duration": 30,
        "image_url": "https://i.pinimg.com/1200x/87/e2/4f/87e24f4299ff167b7ec559c4428d954a.jpg"
    },
    {
        "name": "Decoloración",
        "description": "Transforma tu cabello con una decoloración profesional que cuida tu melena mientras logra el tono deseado.",
        "price": 30,
        "duration": 60,
        "image_url": "https://i.pinimg.com/736x/05/72/6c/05726c747639c4f2c98ebe581fe4fe30.jpg"
    },
    {
        "name": "Barba",
        "description": "Tratamientos especializados para barbas: desde modelado hasta hidratación, para un aspecto pulido y saludable.",
        "price": 15,
        "duration": 20,
        "image_url": "https://i.pinimg.com/1200x/24/e5/e2/24e5e2310537f980e9a3dc8acfafa0c7.jpg"
    },
    {
        "name": "Corte de Cabello con Diseño",
        "description": "Cortes de cabello con diseños únicos y personalizados, realizados por nuestros barberos expertos.",
        "price": 25,
        "duration": 40,
        "image_url": "https://i.pinimg.com/736x/3b/9a/a6/3b9aa688d9baf5cc5121337608649b86.jpg"
    }
]

with app.app_context():
    for s in servicios_data:
        if not Service.query.filter_by(name=s["name"]).first():
            nuevo_servicio = Service(**s)
            db.session.add(nuevo_servicio)
    db.session.commit()
    print("Servicios iniciales registrados correctamente.")

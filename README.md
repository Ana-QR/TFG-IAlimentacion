# 🧠 IAlimentación

IAlimentación es una aplicación web que optimiza la planificación de la compra mediante inteligencia artificial. Entrenada con datos de supermercados (productos, precios y nutrición), esta herramienta ayuda a los usuarios a encontrar la mejor relación calidad-precio y a recibir recomendaciones personalizadas.

---

## 🚀 Características principales

- 📝 Registro e inicio de sesión con autenticación segura (JWT)
- 🛒 Lista de la compra inteligente con historial
- 🍽️ Generación de recetas a partir de los productos en la lista
- 🧠 IA híbrida: Gemini y OpenAI (GPT-3.5 Turbo) con fallback automático
- 🧾 Recomendaciones de supermercado personalizadas
- 🌱 Estética cuidada, limpia y responsive

---

## 🛠️ Tecnologías utilizadas

**Frontend**:
- React
- Vite
- TailwindCSS
- Framer Motion

**Backend**:
- Node.js + Express
- PostgreSQL (ORM: Prisma)
- JWT + bcrypt

**IA**:
- Google Gemini (vía Google Generative AI API)
- OpenAI GPT-3.5 Turbo (fallback)

---

## 📷 Capturas de pantalla
![alt text](image.png)


---

## 📦 Instalación local

```bash
# Clona el repositorio
git clone https://github.com/Ana-QR/TFG-IAlimentacion.git
cd IAlimentacion

# Instala dependencias del frontend
cd frontend
npm install

# Instala dependencias del backend
cd ../backend
npm install

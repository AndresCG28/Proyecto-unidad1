# Tareas - Gestión de Tareas en la Nube

Una aplicación web moderna y responsiva para la gestión de tareas, sincronizada en tiempo real con Supabase.

## 🚀 Características
- **Autenticación en la Nube**: Registro e inicio de sesión seguro con Supabase Auth.
- **Sincronización en Tiempo Real**: Las tareas se actualizan automáticamente en todos los dispositivos.
- **Diseño Premium**: Interfaz moderna con Glassmorphism y tipografía 'Outfit'.
- **Totalmente Responsiva**: Optimizada para PC, tablets y móviles.
- **Dashboard de Productividad**: Estadísticas rápidas de tus tareas.
- **Gestión Completa (CRUD)**: Crear, editar, eliminar y marcar tareas como completadas.
- **Filtros y Búsqueda**: Encuentra tus tareas rápidamente por estado o texto.

## 🛠️ Tecnologías
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend / Database**: [Supabase](https://supabase.com/).
- **Iconos**: [Font Awesome](https://fontawesome.com/).
- **Fuentes**: [Google Fonts (Outfit)](https://fonts.google.com/).

## ⚙️ Configuración y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd <nombre-de-la-carpeta>
```

### 2. Configurar Supabase
1. Crea un proyecto en [Supabase](https://app.supabase.com/).
2. Crea una tabla llamada `tasks` con los siguientes campos:
   - `id`: uuid (autogenerado).
   - `created_at`: timestamp.
   - `user_id`: uuid (referencia a auth.users).
   - `title`: text (obligatorio).
   - `description`: text (opcional).
   - `completed`: boolean (default: false).
3. Habilita **Row Level Security (RLS)** y crea una política que permita a los usuarios gestionar solo sus propias tareas:
   - SELECT, INSERT, UPDATE, DELETE: `auth.uid() = user_id`.
4. En el archivo `auth.js`, reemplaza:
   - `YOUR_SUPABASE_URL` con el API URL de tu proyecto.
   - `YOUR_SUPABASE_ANON_KEY` con tu Anon Key.

### 3. Ejecutar
Dado que no usa Node.js, puedes simplemente abrir `index.html` en tu navegador o usar una extensión como "Live Server" en VS Code.

## 📱 Cómo abrir en tu Móvil

Existen dos formas principales de ver tu aplicación en un teléfono:

### Opción A: Red Local (Para pruebas rápidas)
1. Conecta tu PC y tu teléfono a la **misma red Wi-Fi**.
2. En tu PC, usa una extensión como **Live Server** de VS Code para iniciar el proyecto.
3. Busca la **IP Local** de tu computadora (ej: `192.168.1.10`).
4. En el navegador de tu teléfono, entra a la dirección `http://TU_IP:5500`.

### Opción B: Despliegue en la Nube (Recomendado)
Puedes subir tus archivos a **Vercel**, **Netlify** o **GitHub Pages**. Al ser una página estática (HTML/CSS/JS), funcionará instantáneamente y tendrás un enlace que podrás abrir desde cualquier lugar del mundo.

---

## 🤖 Automatización de Commits

He incluido un script que realiza commits automáticos cada vez que guardas un cambio local:

1. Abre una terminal de **PowerShell** en la carpeta del proyecto.
2. Ejecuta el script:
   ```powershell
   .\git-auto-commit.ps1
   ```
3. ¡Listo! Cualquier cambio que realices se guardará automáticamente en tu historial de Git.

## 🌐 Despliegue
Puedes desplegar este proyecto en **Vercel** o **GitHub Pages** arrastrando los archivos o conectando tu repositorio. Asegúrate de que las credenciales de Supabase estén correctamente configuradas.

---
Proyecto desarrollado para la Unidad 1.

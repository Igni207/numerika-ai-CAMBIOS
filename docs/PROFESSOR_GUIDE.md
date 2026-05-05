# 📘 Guía de Aplicación - NumérikaAI

¡Bienvenido a NumérikaAI! Esta guía está diseñada para mostrar las funcionalidades clave del sistema durante la presentación del proyecto. Nuestra plataforma no solo resuelve cálculos numéricos, sino que se convierte en un entorno educativo e inteligente para acompañar al estudiante.

## 🌟 Funcionalidades Principales a Mostrar

### 1. Registro y Autenticación Segura
NumérikaAI cuenta con un sistema de usuarios completo y seguro:
- **Demostración:** 
  1. Dirígete a "Registro" e ingresa datos simulando a un estudiante (ej. `estudiante@ucasal.edu.ar`).
  2. Una vez registrado, el sistema saludará al usuario por su nombre.
  3. Cierra sesión y vuelve a ingresar. Podrás observar que la sesión se mantiene estable y rápida gracias al almacenamiento en caché seguro del lado del cliente.
- **Valor Educativo:** Permite que en el futuro cada alumno guarde su historial de cálculos y progreso personalizado.

### 2. Módulo de Métodos Numéricos (Solver)
El corazón matemático del proyecto. NumérikaAI ahora procesa fórmulas de manera 100% nativa, rápida y segura en el navegador sin depender de motores externos pesados.
- **Demostración:** 
  1. Abre la sección "Calculadora" o "Métodos Numéricos".
  2. Ingresa una función matemática compleja (ej. `x^2 - 4*x + 4`).
  3. Ejecuta métodos como **Bisección**, **Secante** o **Newton-Raphson**.
  4. Observa cómo la aplicación no solo te da el resultado final, sino que genera de inmediato una **tabla iterativa** paso a paso y gráficos dinámicos mostrando el comportamiento de la función.
- **Valor Educativo:** El estudiante puede ver *cómo* se llegó al resultado iteración por iteración, validando su entendimiento del concepto matemático.

### 3. Asistente Educativo: IKA (IA Integrada)
Un pilar de innovación en NumérikaAI es **IKA**, nuestro asistente potenciado por Inteligencia Artificial.
- **Demostración:**
  1. Tras realizar un cálculo (ej. calcular la raíz mediante Bisección), verás un botón que dice **"Explicar con IKA"**.
  2. Haz clic y la inteligencia artificial generará una explicación pedagógica *sobre ese cálculo exacto*.
  3. **Chat Lateral:** Abre el widget flotante en la esquina de la pantalla. Allí puedes conversar libremente con IKA sobre dudas matemáticas generales, pedir definiciones conceptuales o ayuda sobre cómo plantear un problema.
  4. IKA recuerda la conversación (historial de chats), permitiendo mantener un hilo de estudio continuo a lo largo de la sesión.

### 4. Entorno Preparado para la Web (Nube)
El proyecto ha madurado desde un entorno puramente local a una arquitectura lista para la web (Despliegue Fullstack Vercel). 
- Esto garantiza que en el futuro la universidad y los alumnos puedan acceder a NumérikaAI simplemente desde un link en sus teléfonos móviles o computadoras, sin necesidad de instalación previa.

---

### 💡 Tips para la Presentación
- Se recomienda tener la terminal local corriendo en segundo plano y demostrar que la interfaz de usuario no presenta caídas ni "pantallas de carga infinitas".
- Ingresa un valor matemáticamente incorrecto (ej. división por cero o un intervalo inválido en bisección) para mostrar cómo el sistema captura el error y avisa amigablemente al usuario en lugar de romperse.

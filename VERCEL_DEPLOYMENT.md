# Configuración de Deploy en Vercel - Proyecto Academico Frontend

## 📋 Resumen del Proyecto

- **Framework:** Angular 16.2.0
- **Nombre del Proyecto:** sistema-frontend (academico-frontend)
- **Directorio de Build:** `dist/sistema-frontend`
- **Routing:** Angular Router con lazy loading
- **Backend URL (Producción):** `https://academico-backend-production.up.railway.app`

---

## ⚠️ IMPORTANTE - Error 403 en Producción

Si después del deploy ves un error **403 Forbidden** en la consola del navegador al intentar hacer login, es porque **el backend necesita configurar CORS** para permitir requests desde tu dominio de Vercel.

**Pasos inmediatos:**
1. Obtén tu URL de Vercel después del primer deploy (ej: `https://academico-frontend-xxx.vercel.app`)
2. Agrega esa URL a la configuración CORS de tu backend en Railway
3. Ver sección "Troubleshooting → Error 403 Forbidden" más abajo para código ejemplo

---

## 🔧 Archivos de Configuración Creados/Modificados

### 1. `vercel.json` ✅ CREADO

Archivo de configuración principal de Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/sistema-frontend"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|json))",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Propósito:**
- Define el builder `@vercel/static-build` para aplicaciones Angular
- Configura el directorio de salida del build
- Establece reglas de routing para SPA (todas las rutas redirigen a index.html)
- Configura cache para archivos estáticos

---

### 2. `.vercelignore` ✅ CREADO

Archivo para excluir archivos innecesarios del deploy:

```
node_modules
.angular
.git
*.log
.vscode
.idea
coverage
e2e
```

**Propósito:**
- Reduce el tamaño del deploy
- Excluye archivos de desarrollo y dependencias

---

### 3. `src/environments/environment.prod.ts` ✅ CREADO

Configuración de entorno para producción:

```typescript
export const environment = {
  production: true,
  base: 'https://your-backend-api-url.com'
};
```

**⚠️ ACCIÓN REQUERIDA:**
- Reemplazar `'https://your-backend-api-url.com'` con la URL real de tu API backend
- Este archivo se usará automáticamente en builds de producción

---

### 4. `package.json` ✅ MODIFICADO

Script agregado para Vercel:

```json
"scripts": {
  "build:vercel": "ng build --configuration production"
}
```

**Propósito:**
- Vercel ejecutará automáticamente este script durante el deploy
- Compila la aplicación en modo producción con optimizaciones

---

### 5. `angular.json` ✅ MODIFICADO

Configuración de file replacements para producción:

```json
"production": {
  "fileReplacements": [
    {
      "replace": "src/environments/environments.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ],
  ...
}
```

**Propósito:**
- Reemplaza automáticamente el archivo de ambiente de desarrollo por el de producción
- Asegura que la URL del backend sea la correcta en producción

---

### 6. `src/app/services/login.service.ts` ✅ CORREGIDO

**Problema encontrado:** URL hardcodeada a localhost

**Solución aplicada:**
```typescript
// Antes (incorrecto):
return this.http.post("http://localhost:8080/auth/login", request);

// Después (correcto):
import { environment } from 'src/environments/environments';
return this.http.post(`${environment.base}/auth/login`, request);
```

**Propósito:**
- Usa la variable de entorno correcta según el ambiente (desarrollo/producción)
- Elimina el error de "No hay token en sessionStorage" en producción

---

## 🚀 Pasos para Deploy en Vercel

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Click en "Add New Project"
   - Importa el repositorio `academico-frontend`

3. **Configuración del Proyecto**
   - **Framework Preset:** Angular
   - **Build Command:** `npm run build:vercel` (auto-detectado)
   - **Output Directory:** `dist/sistema-frontend` (auto-detectado)
   - **Install Command:** `npm install`

4. **Variables de Entorno (Opcional)**
   - Si necesitas configurar variables de entorno adicionales, agrégalas en la configuración del proyecto

5. **Deploy**
   - Click en "Deploy"
   - Espera a que el build se complete (aproximadamente 2-5 minutos)

### Opción 2: Deploy desde CLI

1. **Instala Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy a Producción**
   ```bash
   vercel --prod
   ```

---

## ⚙️ Variables de Entorno en Vercel

Si necesitas diferentes URLs de backend por ambiente:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** → **Environment Variables**
3. Agrega variables según necesites:
   - `PRODUCTION_API_URL`: URL del backend en producción
   - `STAGING_API_URL`: URL del backend en staging (opcional)

**Nota:** Para usar variables de entorno de Vercel en Angular, necesitarás configuración adicional con `@vercel/build` o usar un enfoque de build-time replacement.

---

## 🔍 Verificación Post-Deploy

Después del deploy exitoso, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El routing funciona (navega entre rutas diferentes)
3. ✅ Las llamadas a la API funcionan correctamente
4. ✅ Los assets estáticos (imágenes, estilos) se cargan
5. ✅ No hay errores en la consola del navegador

---

## 🐛 Troubleshooting

### Error: "404 on page refresh"
- **Solución:** Verifica que `vercel.json` tenga la regla de routing para SPA
- El archivo actual ya incluye esta configuración

### Error: "API calls failing"
- **Solución:** Verifica la URL del backend en `environment.prod.ts`
- Asegúrate que el backend tenga CORS configurado correctamente

#### Error 403 Forbidden en /auth/login

**Causa:** El backend no está permitiendo requests desde el dominio de Vercel por CORS.

**Solución en el Backend (Spring Boot):**

1. Agrega la configuración CORS en tu backend. Crea o actualiza la clase de configuración:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        // Permitir tu dominio de Vercel
        config.addAllowedOrigin("https://tu-app.vercel.app");
        config.addAllowedOrigin("https://academico-frontend.vercel.app");
        // Para desarrollo local (remover en producción si no es necesario)
        config.addAllowedOrigin("http://localhost:4200");
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

2. **O** si usas `@CrossOrigin` en el controlador, actualízalo:

```java
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {
    "https://tu-app.vercel.app",
    "https://academico-frontend.vercel.app",
    "http://localhost:4200"
})
public class AuthController {
    // ... tu código
}
```

3. **Railway.app específico:** Asegúrate que tu backend en Railway acepte conexiones de cualquier origen durante las pruebas:

```java
config.addAllowedOriginPattern("https://*.vercel.app");
```

**Verificar CORS desde el navegador:**
```javascript
// Abre la consola en tu app de Vercel y ejecuta:
fetch('https://academico-backend-production.up.railway.app/auth/login', {
  method: 'OPTIONS',
  headers: { 'Access-Control-Request-Method': 'POST' }
}).then(r => console.log(r.headers.get('Access-Control-Allow-Origin')))
```

### Error: "Build fails"
- **Solución:** Ejecuta `npm run build:vercel` localmente para identificar errores
- Revisa que todas las dependencias estén en `package.json`

### Errores de Budget Size
- **Solución:** Los límites actuales son:
  - Initial: 2MB máximo
  - Component styles: 20KB máximo
- Estos límites fueron ajustados para acomodar el tamaño real de la aplicación
- **Recomendación:** Optimiza archivos CSS grandes, especialmente `home.component.css` (13.94 kB)

---

## 📝 Notas Importantes

1. **Backend API:** Debes actualizar la URL en `src/environments/environment.prod.ts` antes del deploy

2. **CORS:** Asegúrate que tu backend permita requests desde el dominio de Vercel (ej: `https://tu-app.vercel.app`)

3. **Actualizaciones Automáticas:** Cada push a la rama `main` en GitHub desplegará automáticamente a producción

4. **Preview Deployments:** Cada Pull Request generará un preview deployment automáticamente

5. **Dominios Personalizados:** Puedes agregar dominios personalizados desde el dashboard de Vercel

---

## 🔄 Actualizaciones Futuras

Para deployar cambios:

```bash
git add .
git commit -m "Tu mensaje de commit"
git push origin main
```

Vercel automáticamente detectará el cambio y redesplegará la aplicación.

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Deploy Angular en Vercel](https://vercel.com/guides/deploying-angular-with-vercel)
- [Angular Build Configuration](https://angular.io/guide/build)

---

## ✅ Checklist Pre-Deploy

- [ ] Código commiteado y pusheado a GitHub
- [ ] URL del backend actualizada en `environment.prod.ts`
- [ ] Build local exitoso (`npm run build:vercel`)
- [ ] Backend configurado con CORS para dominio Vercel
- [ ] Variables de entorno configuradas (si aplica)
- [ ] Cuenta de Vercel creada y conectada a GitHub

---

**Fecha de Configuración:** 21 de Noviembre, 2025  
**Versión de Angular:** 16.2.0  
**Estado:** ✅ Listo para Deploy

/**
 * Middleware de Memorización configurable con política LRU
 * @param {Object} options - Opciones de configuración del cache
 * @param {number} options.max - Número máximo de items en el cache
 * @param {number} options.maxAge - Tiempo de expiración en milisegundos
 * @returns {Function} Middleware de Express
 */
function memoizationMiddleware(options = { max: 3, maxAge: 30000 }) {
    // Validate options
    const max = options.max || 50;
    const maxAge = options.maxAge || 30000;
  

    const cache = new Map();
    

    const accessLog = new Map();
    

    const generateCacheKey = (req) => {
      const { method, originalUrl } = req;

      return `${method}:${originalUrl}`;
    };
  
    // Función para limpiar entradas expiradas
    const removeExpiredEntries = () => {
      const now = Date.now();
      for (const [key, timestamp] of accessLog.entries()) {
        if (now - timestamp > maxAge) {
          cache.delete(key);
          accessLog.delete(key);
        }
      }
    };
  
    // Función para aplicar política LRU cuando se alcanza el límite
    const applyLRUPolicy = () => {
      if (cache.size <= max) return;
      

      const entries = Array.from(accessLog.entries())
        .sort((a, b) => a[1] - b[1]);
      
      
      const entriesToRemove = entries.slice(0, cache.size - max);
      for (const [key] of entriesToRemove) {
        cache.delete(key);
        accessLog.delete(key);
      }
    };
  
    // Middleware principal
    return function(req, res, next) {
      // Generar clave de cache para esta petición
      const cacheKey = generateCacheKey(req);
      

      removeExpiredEntries();
      
  
      if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        
    
        accessLog.set(cacheKey, Date.now());

        return res.status(cachedData.status)
                 .set(cachedData.headers)
                 .send(cachedData.body);
      }
      
      // No hay cache, interceptar res.send para guardar la respuesta
      const originalSend = res.send;
      res.send = function(body) {
 
        if (res.statusCode >= 200 && res.statusCode < 300) {
     
          cache.set(cacheKey, {
            status: res.statusCode,
            headers: res.getHeaders(),
            body
          });
          
       
          accessLog.set(cacheKey, Date.now());
          
          applyLRUPolicy();
        }
        
     
        return originalSend.call(this, body);
      };
      
   
      next();
    };
  }
  
  export default memoizationMiddleware;
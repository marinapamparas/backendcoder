# Proyecto NodeJS, curso BackEnd en CoderHouse

Pruebas para la segunda entrega del proyecto final:

- Endpoint tipo GET de products con paginacion incluida
  
Con query por categoria:
http://localhost:8080/api/products?query={%22category%22:%22Cocina%22}

Con query por disponibilidad:
http://localhost:8080/api/products?query={%22stock%22:%2210%22}

Con opciones de limit, page y sort ascendente:
http://localhost:8080/api/products?query={%22category%22:%22Cocina%22}&limit=2&page=2&sort=1

Con opciones de limit, page y sort descendente:
http://localhost:8080/api/products?query={%22category%22:%22Cocina%22}&limit=2&page=2&sort=-1

- Endpoints nuevos de cart, para probar desde postman:

Endpoint tipo DELETE para eliminar un producto del carrito:
localhost:8080/api/carts/6643a0ef8c180e8f012c8b54/product/66437f673e4d32f3df08752f

Endpoint tipo DELETE para eliminar todos los productos del carrito:
localhost:8080/api/carts/6643a0ef8c180e8f012c8b54

Endpoint tipo PUT para modificar la cantidad de un producto determinado:
localhost:8080/api/carts/6643a0d88c180e8f012c8b52/product/6643998455629dc0aa30ea17/4

- Vistas

Vista de los productos que se encuentran en el carrito con id 6643a0ef8c180e8f012c8b54:
http://localhost:8080/api/views/cart/6643a0ef8c180e8f012c8b54

Vista de productos con paginación:
http://localhost:8080/api/views/products

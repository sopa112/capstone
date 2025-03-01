
const errorMiddleware = (err, req, res, next) => {
  //  error para depuración
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor'; 


  res.status(statusCode).json({
    success: false,
    message: message,
  });

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Error de duplicación',
      error: `El valor '${err.keyValue.name}' ya existe.`,
    });
  }
};

export default errorMiddleware;
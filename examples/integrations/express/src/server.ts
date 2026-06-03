import express from 'express';
import { productsRouter } from './routes/products.js';

const app = express();

app.use(productsRouter);

app.listen(3000, () => {
  console.log('Express URLKit example: http://localhost:3000/products');
});

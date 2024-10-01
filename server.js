import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import { request } from "http";
import { error } from "console";

const PORT = 1111;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (request, response) => {
  fs.readFile("./datas/products.json", "utf-8", (readError, data) => {
    if (readError) {
      return response.status(500).json({
        success: false,
        message: "Failed to read data",
        error: readError.message,
      });
    }
    try {
      const products = JSON.parse(data);
      response.json(products);
    } catch (parseError) {
      return response.status(500).json({
        success: false,
        message: "Failed to parse data",
        error: parseError.message,
      });
    }
  });
});

app.post("/", (request, response) => {
  const { productName, category, price } = request.body;

  fs.readFile("./datas/products.json", "utf-8", (readError, data) => {
    if (readError && !data) {
      return response.json({ success: false, error: readError.message });
    }

    const savedData = data ? JSON.parse(data) : [];
    const newProduct = {
      id: Date.now().toString(),
      productName,
      category,
      price,
    };
    savedData.push(newProduct);

    fs.writeFile(
      "./datas/products.json",
      JSON.stringify(savedData, null, 2),
      (writeError) => {
        if (writeError) {
          return response.status(500).json({
            success: false,
            error: writeError.message,
          });
        }
        response.json({
          success: true,
          product: newProduct,
        });
      }
    );
  });
});

app.delete("/", (request, response) => {
  const { id } = request.body;

  fs.readFile("./datas/products.json", "utf-8", (readError, data) => {
    if (readError) {
      return response.status(500).json({
        success: false,
        message: "Failed to read data",
        error: readError.message,
      });
    }

    const savedData = JSON.parse(data);
    const productsData = savedData.filter((product) => product.id !== id);

    if (productsData.length === savedData.length) {
      return response.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    fs.writeFile(
      "./datas/products.json",
      JSON.stringify(productsData, null, 2),
      (writeError) => {
        if (writeError) {
          return response.status(500).json({
            success: false,
            error: writeError.message,
          });
        }
        response.json({
          success: true,
          message: "Product deleted successfully",
        });
      }
    );
  });
});

app.put("/", (request, response) => {
  const { id, productName, category, price } = request.body;

  fs.readFile("./datas/products.json", "utf-8", (readError, data) => {
    if (readError) {
      return response.status(500).json({
        success: false,
        message: "Failed to read data",
        error: readError.message,
      });
    }

    let productData = JSON.parse(data);
    let productFound = false;

    // Update the product if the ID matches
    productData = productData.map((product) => {
      if (product.id === id) {
        productFound = true;
        return { id, productName, category, price }; // Return updated product
      }
      return product; // Return unchanged product
    });

    if (!productFound) {
      return response.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    fs.writeFile(
      "./datas/products.json",
      JSON.stringify(productData, null, 2),
      (writeError) => {
        if (writeError) {
          return response.status(500).json({
            success: false,
            message: "Failed to write data",
            error: writeError.message,
          });
        }
        response.json({
          success: true,
          message: "Product updated successfully",
          product: { id, productName, category, price },
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

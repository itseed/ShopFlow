// Test script for ProductService low stock functionality
import { productService } from "@shopflow/api";

async function testLowStockFunctionality() {
  console.log("Testing ProductService low stock functionality...");

  try {
    // Test 1: Get all products
    console.log("\n1. Testing getAll() with lowStock filter...");
    const allProductsResult = await productService.getAll({ lowStock: true });

    if (allProductsResult.success) {
      console.log("✓ Low stock query successful");
      console.log(
        `Found ${allProductsResult.data?.length || 0} low stock products`
      );

      // Show the first few products if any
      if (allProductsResult.data && allProductsResult.data.length > 0) {
        console.log("Sample low stock products:");
        allProductsResult.data
          .slice(0, 3)
          .forEach((product: any, index: number) => {
            console.log(
              `  ${index + 1}. ${product.name}: stock=${
                product.stock
              }, min_stock=${product.min_stock}`
            );
          });
      }
    } else {
      console.log("✗ Low stock query failed:", allProductsResult.error);
    }

    // Test 2: Count low stock products
    console.log("\n2. Testing count() with lowStock filter...");
    const countResult = await productService.count({ lowStock: true });

    if (countResult.success) {
      console.log("✓ Low stock count successful");
      console.log(`Count: ${countResult.data}`);
    } else {
      console.log("✗ Low stock count failed:", countResult.error);
    }

    // Test 3: Get low stock products directly
    console.log("\n3. Testing getLowStock() method...");
    const lowStockResult = await productService.getLowStock();

    if (lowStockResult.success) {
      console.log("✓ getLowStock() successful");
      console.log(
        `Found ${lowStockResult.data?.length || 0} low stock products`
      );
    } else {
      console.log("✗ getLowStock() failed:", lowStockResult.error);
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test
testLowStockFunctionality()
  .then(() => {
    console.log("\nTest completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import sharp from "sharp";
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectCustomLabelsCommand,
} from "@aws-sdk/client-rekognition";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

  // Local fallback DB for listings to "not lose data" if AWS is not configured
  const DB_FILE = path.join(process.cwd(), "local_db.json");
  let p2pListings: any[] = [];
  
  // In-memory queue for Lifecycle Routing Matrix
  let routingQueue: any[] = [];

  try {
    if (fs.existsSync(DB_FILE)) {
      p2pListings = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } else {
      p2pListings = [
        {
          id: "P2P-001",
          seller: "Priyanka Desai",
          title: "Apple Watch Series 9 (GPS 45mm)",
          grade: "A",
          price: 32000,
          img: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-45-stainless-graphite-sport-band-midnight-s9?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=eUNRakR3dGYxaW9BQzAzdzRPUlFUVjBoTUc3NjFlV1QzbHd4SVVUcFZVWDE4QUxxTWFsRmJQTXB3MEp1T2pHd0FtWVJCbTFqbVlJVmw3ZkRFUGZoZ0YzaTQrYy82TUg0cFZQeUN1eC9DMlZNQkJEMXc0aklkVno5c3lHT1ZQU0FzcnlGampyTlhrVGsvR1hoblVqQkpn",
          createdAt: Date.now(),
        },
        {
          id: "P2P-002",
          seller: "Rahul Sharma",
          title: "Sony WH-1000XM5 Noise Cancelling",
          grade: "B",
          price: 18000,
          img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
          createdAt: Date.now() - 1000,
        },
        {
          id: "P2P-003",
          seller: "Sneha Reddy",
          title: "Kindle Paperwhite (16 GB)",
          grade: "C",
          price: 8500,
          img: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=400&q=80",
          createdAt: Date.now() - 2000,
        },
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(p2pListings));
    }
  } catch (e) {
    console.error("Local DB read error", e);
  }

  // Helper to initialize DynamoDB Client
  const getDynamoDocClient = () => {
    const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
      process.env;
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) return null;
    const client = new DynamoDBClient({ region: AWS_REGION || "us-east-1" });
    return DynamoDBDocumentClient.from(client);
  };

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/p2p/listings", async (req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        p2pListings = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }
    res.json({ success: true, data: p2pListings });
  });

  app.post("/api/p2p/list", async (req, res) => {
    const { title, size, grade, price, img, seller, health } = req.body;
    const newListing = {
      id: "P2P-" + Math.floor(Math.random() * 10000) + Date.now(),
      title: title || "Nike Men's Revolution 6 Running Shoe",
      size: size || null,
      grade: grade || "B",
      price: price || 1500,
      img:
        img ||
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      seller: seller || "Anonymous",
      health: health || null,
      createdAt: Date.now(),
    };

    try {
      if (fs.existsSync(DB_FILE)) {
        p2pListings = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }
    p2pListings.unshift(newListing);
    fs.writeFileSync(DB_FILE, JSON.stringify(p2pListings));
    res.json({ success: true, data: newListing });
  });

  const ORDERS_DB_FILE = path.join(process.cwd(), "local_db_orders.json");
  let p2pOrders: any[] = [];

  try {
    if (fs.existsSync(ORDERS_DB_FILE)) {
      p2pOrders = JSON.parse(fs.readFileSync(ORDERS_DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Orders DB read error", e);
  }

  app.post("/api/p2p/checkout", async (req, res) => {
    const { id, buyerName } = req.body;
    try {
      if (fs.existsSync(DB_FILE)) {
        p2pListings = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      }
      if (fs.existsSync(ORDERS_DB_FILE)) {
        p2pOrders = JSON.parse(fs.readFileSync(ORDERS_DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }

    const listingIndex = p2pListings.findIndex((item) => item.id === id);
    if (listingIndex !== -1) {
      const listing = p2pListings[listingIndex];
      // remove from listings
      p2pListings.splice(listingIndex, 1);
      fs.writeFileSync(DB_FILE, JSON.stringify(p2pListings));

      // add to orders
      p2pOrders.unshift({
        ...listing,
        buyerName: buyerName || "Revanth",
        orderedAt: Date.now(),
        status: "accepted"
      });
      fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(p2pOrders));
    }
    
    res.json({ success: true });
  });

  app.get("/api/p2p/orders/:seller", async (req, res) => {
    const { seller } = req.params;
    try {
      if (fs.existsSync(ORDERS_DB_FILE)) {
        p2pOrders = JSON.parse(fs.readFileSync(ORDERS_DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }
    const sellerOrders = p2pOrders.filter(o => o.seller === seller);
    res.json({ success: true, data: sellerOrders });
  });

  app.post("/api/p2p/orders/:id/ship", async (req, res) => {
    const { id } = req.params;
    try {
      if (fs.existsSync(ORDERS_DB_FILE)) {
        p2pOrders = JSON.parse(fs.readFileSync(ORDERS_DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }
    const orderIndex = p2pOrders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
      p2pOrders[orderIndex].status = "shipped";
      fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(p2pOrders));
    }
    res.json({ success: true });
  });

  app.delete("/api/p2p/list/:id", async (req, res) => {
    const { id } = req.params;
    try {
      if (fs.existsSync(DB_FILE)) {
        p2pListings = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      }
    } catch (e) {
      console.error(e);
    }

    p2pListings = p2pListings.filter((item) => item.id !== id);
    fs.writeFileSync(DB_FILE, JSON.stringify(p2pListings));
    res.json({ success: true });
  });

  // Admin Queue Endpoints
  app.get("/api/admin/queue", (req, res) => {
    res.json({ success: true, data: routingQueue });
  });

  app.post("/api/admin/queue", (req, res) => {
    const newItem = {
      ...req.body,
      id: req.body.id || "RET-" + Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      origin: "Customer Return"
    };
    // Put at the top of the queue
    routingQueue.unshift(newItem);
    res.json({ success: true, data: newItem });
  });
  
  app.delete("/api/admin/queue/:id", (req, res) => {
    routingQueue = routingQueue.filter(i => i.id !== req.params.id);
    res.json({ success: true });
  });

  // Admin Inventory
  let localInventory: any[] = [
    { sku: "MEN-SH-849", category: "Men's Running Shoes", grade: "B", stock: 12, value: 24000 },
    { sku: "ELEC-HP-102", category: "Wireless Headphones", grade: "A", stock: 4, value: 18000 },
    { sku: "HM-CF-301", category: "Coffee Maker", grade: "C", stock: 2, value: 3500 },
  ];
  
  app.get("/api/admin/inventory", (req, res) => {
    res.json({ success: true, data: localInventory });
  });

  app.post("/api/admin/inventory", (req, res) => {
    const { category, grade, value } = req.body;
    const existing = localInventory.find(i => i.category === category && i.grade === grade);
    if (existing) {
      existing.stock += 1;
      existing.value += value;
    } else {
      localInventory.unshift({
        sku: "ITM-" + Math.floor(Math.random() * 1000),
        category: category || "Unknown",
        grade: grade || "B",
        stock: 1,
        value: value || 1500
      });
    }
    res.json({ success: true, data: localInventory });
  });

  // ==========================================
  // REAL: Upload P2P listing image to AWS S3
  // ==========================================
  app.post("/api/p2p/upload", upload.single("image"), async (req, res) => {
    try {
      const {
        APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID,
        APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY,
        APP_AWS_REGION: AWS_REGION,
        APP_AWS_S3_BUCKET_NAME: AWS_S3_BUCKET_NAME,
      } = process.env;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
        console.log("Mocking S3 upload - AWS credentials or bucket missing.");
        // Fallback: Use base64 for preview without S3
        const base64Img = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        return res.json({
          success: true,
          imageUrl: base64Img,
        });
      }

      // Real AWS S3 Upload
      const region = AWS_REGION || "us-east-1";
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3Client = new S3Client({ region });

      const fileExt = req.file.originalname.split(".").pop() || "jpg";
      const key = `p2p-listings/img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const putCommand = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(putCommand);

      const imageUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

      res.json({
        success: true,
        imageUrl,
      });
    } catch (e: any) {
      // Fallback
      if (req.file) {
        const base64Img = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        res.json({ success: true, imageUrl: base64Img });
      } else {
        res.status(500).json({ success: false, message: "Upload failed" });
      }
    }
  });

  // ==========================================
  // REAL: Amazon Rekognition + Bedrock Return Grading Pipeline
  // ==========================================
  app.post("/api/returns/grade", upload.single("image"), async (req, res) => {
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
        process.env;

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.log("Mocking return grade - AWS credentials missing.");
        return setTimeout(() => {
          res.json({
            success: true,
            data: {
              returnId: "RET-" + Math.floor(Math.random() * 1000000),
              grade: "B",
              conditionScore: 82,
              wearAnalysis:
                "Minor scuffing on the heel. Outsole intact. No structural damage.",
              resaleViability: true,
              ecoScore: 90,
            },
          });
        }, 1500);
      }

      // Real AWS Logic
      const region = AWS_REGION || "us-east-1";
      const rekognition = new RekognitionClient({ region });
      const bedrock = new BedrockRuntimeClient({ region });

      let detectedLabels = ["Shoe", "Footwear"];
      let imageBuffer = req.file?.buffer;
      if (req.file) {
        try {
          if (imageBuffer) {
             // Resize image to ensure it's under Rekognition/Bedrock limits (5MB limit)
             imageBuffer = await sharp(imageBuffer)
               .resize(800, 800, { fit: "inside", withoutEnlargement: true })
               .jpeg({ quality: 80 })
               .toBuffer();
          }
          const projectArn = process.env.APP_AWS_REKOGNITION_PROJECT_ARN;
          const isValidArn = projectArn && /^arn:[a-z\d-]+:rekognition:[a-z\d-]+:\d{12}:project\/[a-zA-Z0-9_.\-]{1,255}\/version\/[a-zA-Z0-9_.\-]{1,255}\/[0-9]+$/.test(projectArn);
          if (isValidArn) {
            console.log("Using Rekognition Custom Labels Mode");
            const customCommand = new DetectCustomLabelsCommand({
              ProjectVersionArn: projectArn,
              Image: { Bytes: imageBuffer },
              MaxResults: 10,
              MinConfidence: 50,
            });
            const customRes = await rekognition.send(customCommand);
            detectedLabels = customRes.CustomLabels?.map((l) => l.Name || "") || [];
            console.log("Rekognition Custom Labels:", detectedLabels);
          } else {
            const rekognitionCommand = new DetectLabelsCommand({
              Image: { Bytes: imageBuffer },
              MaxLabels: 10,
              MinConfidence: 70,
            });
            const rekognitionResponse =
              await rekognition.send(rekognitionCommand);
            detectedLabels =
              rekognitionResponse.Labels?.map((l) => l.Name || "") || [];
            console.log("Rekognition General Labels:", detectedLabels);
          }
        } catch (rekError: any) {
          console.log(
            "Rekognition Error (falling back to default labels):",
            rekError.message,
          );
        }
      }

      const prompt = `You are an AI product condition grader for EcoRoute. Please analyze this returned product image and the associated labels: ${detectedLabels.join(", ")}.
      Carefully inspect the item for any signs of use, dirt, or damage.
      If the item appears brand new, unworn, and in pristine condition, you must grade it 'A' and provide a condition score between 95-100.
      If it shows minor wear, grade it 'B' (score 70-94). If it shows heavy wear, grade it 'C' (score 50-69).
      If the item is severely damaged, visibly broken, or in unsalvageable condition, grade it 'D' or 'E' (score below 50).
      Return ONLY a JSON object with exactly these keys: grade (string), conditionScore (number), wearAnalysis (string), resaleViability (boolean), and ecoScore (number). Do not include any extra text.`;

      let parsedData: any = null;

      try {
        let contentPayload: any[] = [];

        if (req.file && imageBuffer) {
          contentPayload.push({
            image: {
              format: "jpeg",
              source: {
                bytes: imageBuffer.toString("base64"),
              },
            },
          });
        }
        contentPayload.push({ text: prompt });

        const bedrockCommand = new InvokeModelCommand({
          modelId: "amazon.nova-lite-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            messages: [{ role: "user", content: contentPayload }],
          }),
        });

        const bedrockResponse = await bedrock.send(bedrockCommand);
        const completion = JSON.parse(
          new TextDecoder().decode(bedrockResponse.body),
        );
        const content = completion.output.message.content[0].text;
        parsedData = JSON.parse(
          content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1),
        );
      } catch (bedrockError: any) {
        console.log(
          "Bedrock Error, using fallback grading:",
          bedrockError.message,
        );
      }

      res.json({
        success: true,
        data: {
          returnId: "RET-" + Math.floor(Math.random() * 1000000),
          grade: parsedData?.grade || "B",
          conditionScore: parsedData?.conditionScore || 82,
          wearAnalysis:
            parsedData?.wearAnalysis ||
            "Minor wear detected based on visual analysis.",
          resaleViability: parsedData?.resaleViability ?? true,
          ecoScore: parsedData?.ecoScore || 90,
          detectedLabels, // Add labels so the frontend can display them
        },
      });
    } catch (e: any) {
      console.log("Rekognition/AWS API Error:", e.message);
      res.json({
        success: true,
        data: {
          returnId: "RET-" + Math.floor(Math.random() * 1000000),
          grade: "B",
          conditionScore: 82,
          wearAnalysis:
            "Minor scuffing on the heel. Outsole intact. No structural damage.",
          resaleViability: true,
          ecoScore: 90,
          detectedLabels: ["Fallback", "Item"],
        },
      });
    }
  });

  // ==========================================
  // REAL: Bedrock Policy Summarizer
  // ==========================================
  app.post("/api/returns/policy-summary", async (req, res) => {
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
        process.env;

      const longPolicyText = `Amazon.in Return Policy:
Items shipped from Amazon.in, including Amazon Warehouse, can be returned within 30 days of receipt of shipment in most cases. Some products have different policies or requirements associated with them.
For Fashion items (clothing, shoes, watches, jewelry), they must be returned in their original packaging, including hangers, polybags, hang tags on garments, shoe boxes, dust bags, and gift boxes. Items must be unused, unworn, unwashed and undamaged.
Electronics and mobiles have a 7-day replacement only window. Non-returnable items include downloadable software, innerwear, personalized items, and perishable goods. Refunds are issued to the original payment method. If your item is eligible for a return, you can choose to ship it yourself or schedule a pickup.`;

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        return setTimeout(() => {
          res.json({
            success: true,
            data: {
              summary:
                "MOCK: You have 30 days to return most items. Fashion items must be unused with tags. Electronics have a 7-day replacement window. Some items are non-returnable.",
            },
          });
        }, 1000);
      }

      // Real AWS Logic
      const region = AWS_REGION || "us-east-1";
      const bedrock = new BedrockRuntimeClient({ region });

      const prompt = `You are a helpful customer service AI. Summarize the following return policy into 2 concise sentences that are easy for a customer to read quickly.
      Policy:
      ${longPolicyText}
      
      Return ONLY a JSON object with this key: "summary" (string).`;

      const bedrockCommand = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ text: prompt }] }],
        }),
      });

      const bedrockResponse = await bedrock.send(bedrockCommand);
      const completion = JSON.parse(
        new TextDecoder().decode(bedrockResponse.body),
      );
      const content = completion.output.message.content[0].text;
      const parsedData = JSON.parse(
        content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1),
      );

      res.json({
        success: true,
        data: {
          summary:
            parsedData.summary ||
            "You have 30 days to return most unused items in original packaging. Electronics have a 7-day replacement window.",
        },
      });
    } catch (e: any) {
      console.log("AWS API Error (Policy Summarizer):", e.message);
      res.json({
        success: true,
        data: {
          summary:
            "You have 30 days to return most unused items in original packaging. Electronics have a 7-day replacement window.",
        },
      });
    }
  });

  // ==========================================
  // REAL: Bedrock Lifecycle Routing Agent
  // ==========================================
  app.post("/api/seller/bulk-analyze", async (req, res) => {
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } = process.env;
      const { items } = req.body;

      if (!items || !items.length) {
         return res.json({ success: true, data: [] });
      }

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        throw new Error("Missing AWS keys");
      }

      const region = AWS_REGION || "us-east-1";
      const bedrock = new BedrockRuntimeClient({ region });
      
      const payloadDescription = items.map((i: any) => `- ID: ${i.id}, Title: ${i.title}, Reason: ${i.returnReason}`).join("\n");

      const prompt = `You are the EcoRoute AI Bulk Analysis Agent. Analyze the following returned products and for each one:
      1. Assign a condition grade 'A', 'B', 'C', 'D', or 'E' based on the product description and return reason.
      2. Decide the best Next Step aiRecommendation (choose ONE): "Warehouse Return", "Refurbish", "Local P2P", or "Donate".
      3. Provide a brief 1-sentence reasoning.
      
      Products:
      ${payloadDescription}

      Return a JSON array of objects securely wrapped in JSON array. Each object MUST HAVE:
      "id" (string matching the ID), 
      "grade" (string), 
      "aiRecommendation" (string), 
      "reasoning" (string),
      "issues" (array of strings, just 1 or 2 assumed issues).
      Do not return any extra text outside the JSON array.`;

      const bedrockCommand = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ text: prompt }] }],
        }),
      });

      const bedrockResponse = await bedrock.send(bedrockCommand);
      const completion = JSON.parse(
        new TextDecoder().decode(bedrockResponse.body),
      );
      const content = completion.output.message.content[0].text;
      const parsedData = JSON.parse(
        content.substring(content.indexOf("["), content.lastIndexOf("]") + 1),
      );

      const gradedItems = items.map((item: any) => {
         const aiData = parsedData.find((p: any) => p.id === item.id) || {};
         const grade = aiData.grade || 'B';
         let priceDrop = 0.2;
         let originalPrice = 2000;
         if (grade === 'A') priceDrop = 0.1;
         if (grade === 'C') priceDrop = 0.5;
         if (grade === 'D') priceDrop = 0.8;
         if (grade === 'E') priceDrop = 1.0;
         
         if (item.title.includes("Shoes")) originalPrice = 3500;
         if (item.title.includes("Earbuds")) originalPrice = 4000;
         if (item.title.includes("Mug")) originalPrice = 500;
         if (item.title.includes("Shirt")) originalPrice = 800;

         return {
           ...item,
           grade,
           issues: aiData.issues || ["Standard return"],
           originalPrice,
           suggestedPrice: Math.floor(originalPrice * (1 - priceDrop)),
           aiRecommendation: aiData.aiRecommendation || "Warehouse Return",
           reasoning: aiData.reasoning || "Standard fallback reason."
         };
      });

      res.json({ success: true, data: gradedItems });

    } catch (e: any) {
      console.log("Mocking Bulk Analysis (Error or no AWS):", e.message);
      
      const { items } = req.body;
      const gradedItems = items.map((item: any) => {
        let grade = 'B';
        let issues = ["General handling marks"];
        let priceDrop = 0.2;
        let originalPrice = 2000;
        let aiRecommendation = "Warehouse Return";
        let reasoning = "Standard open box scenario";

        if (item.title.includes("Shoes")) {
          grade = 'C';
          issues = ["Scuff mark on right toe", "Sole shows light wear"];
          priceDrop = 0.5;
          originalPrice = 3500;
          aiRecommendation = "Local P2P";
          reasoning = "Moderate cosmetic wear reduces pristine resale value, viable for circular P2P audience at a discount.";
        } else if (item.title.includes("Earbuds")) {
          grade = 'B';
          issues = ["Missing charging cable", "Open box"];
          priceDrop = 0.3;
          originalPrice = 4000;
          aiRecommendation = "Refurbish";
          reasoning = "High margin electronics. Adding a new $2 cable restores item to A-grade refurbished value.";
        } else if (item.title.includes("Mug") || item.title.includes("Ceramic")) {
          grade = 'E';
          issues = ["Shattered completely"];
          priceDrop = 1.0;
          originalPrice = 500;
          aiRecommendation = "Donate";
          reasoning = "Item is shattered. High safety risk and zero resale value. Schedule recycling / safe disposal.";
        } else if (item.title.includes("Shirt")) {
          grade = 'D';
          issues = ["Stained heavily"];
          priceDrop = 0.8;
          originalPrice = 800;
          aiRecommendation = "Donate";
          reasoning = "Textile cannot be resold as new due to staining. Recommend textile recycling / donation partner.";
        } else {
          grade = 'A';
          issues = ["Open box, untested but visually flawless"];
          priceDrop = 0.1;
          originalPrice = 1500;
          aiRecommendation = "Warehouse Return";
          reasoning = "Item is in pristine condition. Best economy is returning to original stock via basic packaging replace.";
        }

        return {
          ...item,
          grade,
          issues,
          originalPrice,
          suggestedPrice: Math.floor(originalPrice * (1 - priceDrop)),
          aiRecommendation,
          reasoning
        };
      });

      setTimeout(() => {
        res.json({ success: true, data: gradedItems });
      }, 500);
    }
  });

  app.post("/api/admin/routing/evaluate", async (req, res) => {
    let conditionGrade = "B";
    let category = "Shoes";
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
        process.env;

      if (req.body && req.body.conditionGrade)
        conditionGrade = req.body.conditionGrade;
      if (req.body && req.body.category) category = req.body.category;

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.log("Mocking routing - AWS credentials missing.");
        return setTimeout(() => {
          res.json({
            success: true,
            data: [
              {
                route: "Peer-to-Peer Exchange",
                score: 0.92,
                cost: 40,
                carbon: 0.6,
                recommendation:
                  "Highest sustainability and margin for Grade " +
                  conditionGrade +
                  " " +
                  category,
              },
              {
                route: "Refurbish",
                score: 0.65,
                cost: 320,
                carbon: 7.1,
                recommendation: "Secondary option",
              },
              {
                route: "Resell As-Is",
                score: 0.3,
                cost: 580,
                carbon: 12.4,
                recommendation: "High carbon footprint, default path",
              },
            ],
          });
        }, 1500);
      }

      // Real AWS Logic
      const region = AWS_REGION || "us-east-1";
      const bedrock = new BedrockRuntimeClient({ region });

      const prompt = `You are EcoRoute Lifecycle Routing Agent. You need to rank the following routing options for a returned ${category} with condition Grade ${conditionGrade}.
      Options:
      1. Peer-to-Peer Exchange (Avg Cost: ₹40, Carbon: 0.6 kg CO2)
      2. Refurbish (Avg Cost: ₹320, Carbon: 7.1 kg CO2)
      3. Resell As-Is (Avg Cost: ₹580, Carbon: 12.4 kg CO2)
      4. Donate (Avg Cost: ₹180, Carbon: 4.3 kg CO2)
      
      Rank the top 3 routes by composite sustainability score (carbon 50%, cost 30%, demand 20%).
      Return a JSON array of objects, with each object having exactly these keys: "route" (string), "score" (number from 0 to 1), "cost" (number), "carbon" (number), "recommendation" (short text explaining why).
      Only return the JSON array, nothing else.`;

      const bedrockCommand = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ text: prompt }] }],
        }),
      });

      const bedrockResponse = await bedrock.send(bedrockCommand);
      const completion = JSON.parse(
        new TextDecoder().decode(bedrockResponse.body),
      );
      const content = completion.output.message.content[0].text;

      const parsedData = JSON.parse(
        content.substring(content.indexOf("["), content.lastIndexOf("]") + 1),
      );

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (e: any) {
      console.log("AWS API Error:", e.message);
      res.json({
        success: true,
        data: [
          {
            route: "Peer-to-Peer Exchange",
            score: 0.92,
            cost: 40,
            carbon: 0.6,
            recommendation:
              "Highest sustainability and margin for Grade " +
              conditionGrade +
              " " +
              category,
          },
          {
            route: "Refurbish",
            score: 0.65,
            cost: 320,
            carbon: 7.1,
            recommendation: "Secondary option",
          },
          {
            route: "Resell As-Is",
            score: 0.3,
            cost: 580,
            carbon: 12.4,
            recommendation: "High carbon footprint, default path",
          },
        ],
      });
    }
  });

  // ==========================================
  // REAL: Return Prevention using Bedrock (simulating Personalize insights)
  // ==========================================
  app.post("/api/checkout/return-prevention", async (req, res) => {
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
        process.env;

      const { userId, productId, selectedSize } = req.body || {
        userId: "user123",
        productId: "sneaker-xyz",
        selectedSize: 9,
      };

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        return setTimeout(() => {
          res.json({
            success: true,
            data: {
              interventionType: "size_mismatch",
              recommendation:
                "MOCK: Based on your return history, Size 10 fits you better.",
              confidenceCheck: 0.92,
              tokensIncentivized: 25,
            },
          });
        }, 1000);
      }

      // Real AWS Logic
      const region = AWS_REGION || "us-east-1";
      const bedrock = new BedrockRuntimeClient({ region });

      const prompt = `You are the EcoRoute Return Prevention Agent. 
      The user (ID: ${userId}) is viewing product ${productId} and selected size ${selectedSize}. 
      Assume their past purchase history indicates a high return rate for this size in this brand, and size ${parseInt(selectedSize) + 1} is a better fit.
      
      Generate a short, friendly recommendation advising them to change their size to avoid a return and save environmental costs. 
      Return ONLY a JSON object with these keys: 
      "interventionType" (string, e.g., "size_mismatch"), 
      "recommendation" (string, short advice), 
      "confidenceCheck" (number 0-1), 
      "tokensIncentivized" (number).`;

      const bedrockCommand = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ text: prompt }] }],
        }),
      });

      const bedrockResponse = await bedrock.send(bedrockCommand);
      const completion = JSON.parse(
        new TextDecoder().decode(bedrockResponse.body),
      );
      const content = completion.output.message.content[0].text;
      const parsedData = JSON.parse(
        content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1),
      );

      res.json({
        success: true,
        data: {
          interventionType: parsedData.interventionType || "size_mismatch",
          recommendation:
            parsedData.recommendation ||
            "Consider sizing up based on past purchases to reduce returns.",
          confidenceCheck: parsedData.confidenceCheck || 0.9,
          tokensIncentivized: parsedData.tokensIncentivized || 20,
        },
      });
    } catch (e: any) {
      console.log("AWS API Error (Return Prevention):", e.message);
      res.json({
        success: true,
        data: {
          interventionType: "size_mismatch",
          recommendation: "Our data suggests sizing up may prevent a return.",
          confidenceCheck: 0.85,
          tokensIncentivized: 15,
        },
      });
    }
  });

  // ==========================================
  // REAL: Lambda Auto-haggling negotiation engine with Bedrock Narrative
  // ==========================================
  app.post("/api/negotiations/bid", async (req, res) => {
    try {
      const { APP_AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID, APP_AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY, APP_AWS_REGION: AWS_REGION } =
        process.env;
      const { buyerMaxPrice } = req.body || { buyerMaxPrice: 1200 };
      const listedPrice = 1500;
      const sellerHiddenMin = 1400; // Mocked from DynamoDB

      let dealPrice = 0;
      let status = "counter";
      let counterOffer = 0;

      if (buyerMaxPrice >= sellerHiddenMin) {
        dealPrice = Math.floor(
          sellerHiddenMin + (buyerMaxPrice - sellerHiddenMin) * 0.35,
        );
        status = "closed";
      } else {
        counterOffer = Math.floor(sellerHiddenMin * 0.95);
      }

      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.log("Mocking negotiation - AWS credentials missing.");
        return setTimeout(() => {
          if (status === "closed") {
            res.json({
              success: true,
              data: {
                status: "closed",
                dealPrice,
                systemNarrative: `AI EcoBroker secured this deal at ₹${dealPrice}, saving you ₹${listedPrice - dealPrice}.`,
                tokensEarned: 50,
              },
            });
          } else {
            res.json({
              success: true,
              data: {
                status: "counter",
                counterOffer,
                systemNarrative:
                  "The seller's minimum is slightly higher. Try offering a bit more.",
              },
            });
          }
        }, 1500);
      }

      // Real AWS Logic
      const region = AWS_REGION || "us-east-1";
      const bedrock = new BedrockRuntimeClient({ region });

      const prompt = `You are EcoRoute AI Broker. In one sentence, describe the deal outcome in a positive, exciting way. Mention the amount saved if closed. Be brief. 
      USER Input Context: 
      deal_price=${dealPrice} listed_price=${listedPrice} buyer_max=${buyerMaxPrice} status=${status} counter_offer=${counterOffer}
      Return: one sentence string only. No quotes, no markdown.`;

      const bedrockCommand = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ text: prompt }] }],
        }),
      });

      const bedrockResponse = await bedrock.send(bedrockCommand);
      const completion = JSON.parse(
        new TextDecoder().decode(bedrockResponse.body),
      );
      const narrative = completion.output.message.content[0].text.trim();

      if (status === "closed") {
        res.json({
          success: true,
          data: {
            status,
            dealPrice,
            systemNarrative: narrative,
            tokensEarned: 50,
          },
        });
      } else {
        res.json({
          success: true,
          data: {
            status,
            counterOffer,
            systemNarrative: narrative,
          },
        });
      }
    } catch (e: any) {
      console.log("AWS API Error (Negotiation):", e.message);
      res.json({
        success: true,
        data: {
          status: "counter",
          counterOffer: 1350,
          systemNarrative:
            "The seller's minimum is slightly higher. Try offering a bit more.",
        },
      });
    }
  });

  // ==========================================
  // Vite integration
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Amazon Hackathon Node] AWS Proxy Server running on port ${PORT}`,
    );
  });
}

startServer();

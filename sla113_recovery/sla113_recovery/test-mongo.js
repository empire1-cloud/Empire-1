const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://hybrd_intel_user:ilovexochiyboom113@hybrid-intelligence.giqa2tk.mongodb.net/?appName=hybrid-intelligence";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

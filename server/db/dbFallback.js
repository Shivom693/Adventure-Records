import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import '../models/User.js';
import '../models/Release.js';
import '../models/Ticket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check if MongoDB is connected
let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️  No MONGODB_URI found in env variables. Running in Local JSON File Database mode.');
    isMongoConnected = false;
    return false;
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('🚀 Connected to MongoDB successfully!');
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB, falling back to Local JSON Database:', error.message);
    isMongoConnected = false;
    return false;
  }
};

const getCollectionPath = (collectionName) => {
  return path.join(DATA_DIR, `${collectionName}.json`);
};

const readCollection = (collectionName) => {
  const file = getCollectionPath(collectionName);
  if (!fs.existsSync(file)) {
    try {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
    } catch (e) {}
    return [];
  }
  
  let retries = 5;
  while (retries > 0) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error(`Error reading local collection ${collectionName} after retries:`, err);
        return [];
      }
      // Simple blocking sleep of 15ms to allow filesystem unlock
      const start = Date.now();
      while (Date.now() - start < 15) {}
    }
  }
  return [];
};

const writeCollection = (collectionName, data) => {
  const file = getCollectionPath(collectionName);
  const tempFile = `${file}.tmp`;
  
  let retries = 5;
  while (retries > 0) {
    try {
      // Atomic write pattern: write to temp file then rename
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
      fs.renameSync(tempFile, file);
      break;
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error(`Error writing local collection ${collectionName} after retries:`, err);
      }
      // Simple blocking sleep of 15ms to allow filesystem unlock
      const start = Date.now();
      while (Date.now() - start < 15) {}
    }
  }
};

// Local JSON CRUD helper
const localDB = {
  find: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findOne: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },
  findById: (collection, id) => {
    const items = readCollection(collection);
    return items.find(item => item._id === id || item.id === id) || null;
  },
  create: (collection, data) => {
    const items = readCollection(collection);
    const newItem = {
      _id: 'local_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    writeCollection(collection, items);
    return newItem;
  },
  findByIdAndUpdate: (collection, id, updates) => {
    const items = readCollection(collection);
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    writeCollection(collection, items);
    return items[index];
  },
  deleteOne: (collection, query = {}) => {
    const items = readCollection(collection);
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return false;
    items.splice(index, 1);
    writeCollection(collection, items);
    return true;
  }
};

// Unified DB helper wrapping both Mongoose models and localDB
export const db = {
  isMongo: () => isMongoConnected,

  users: {
    find: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('User').find(query);
      return localDB.find('users', query);
    },
    findOne: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('User').findOne(query);
      return localDB.findOne('users', query);
    },
    findById: async (id) => {
      if (isMongoConnected) return await mongoose.model('User').findById(id);
      return localDB.findById('users', id);
    },
    create: async (data) => {
      if (isMongoConnected) return await mongoose.model('User').create(data);
      return localDB.create('users', data);
    },
    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected) return await mongoose.model('User').findByIdAndUpdate(id, updates, { new: true });
      return localDB.findByIdAndUpdate('users', id, updates);
    }
  },

  releases: {
    find: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Release').find(query);
      return localDB.find('releases', query);
    },
    findOne: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Release').findOne(query);
      return localDB.findOne('releases', query);
    },
    findById: async (id) => {
      if (isMongoConnected) return await mongoose.model('Release').findById(id);
      return localDB.findById('releases', id);
    },
    create: async (data) => {
      if (isMongoConnected) return await mongoose.model('Release').create(data);
      return localDB.create('releases', data);
    },
    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected) return await mongoose.model('Release').findByIdAndUpdate(id, updates, { new: true });
      return localDB.findByIdAndUpdate('releases', id, updates);
    },
    deleteOne: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Release').deleteOne(query);
      return localDB.deleteOne('releases', query);
    }
  },

  tickets: {
    find: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Ticket').find(query);
      return localDB.find('tickets', query);
    },
    findOne: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Ticket').findOne(query);
      return localDB.findOne('tickets', query);
    },
    findById: async (id) => {
      if (isMongoConnected) return await mongoose.model('Ticket').findById(id);
      return localDB.findById('tickets', id);
    },
    create: async (data) => {
      if (isMongoConnected) return await mongoose.model('Ticket').create(data);
      return localDB.create('tickets', data);
    },
    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected) return await mongoose.model('Ticket').findByIdAndUpdate(id, updates, { new: true });
      return localDB.findByIdAndUpdate('tickets', id, updates);
    },
    deleteOne: async (query = {}) => {
      if (isMongoConnected) return await mongoose.model('Ticket').deleteOne(query);
      return localDB.deleteOne('tickets', query);
    }
  }
};

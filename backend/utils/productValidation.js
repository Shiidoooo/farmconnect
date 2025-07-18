// Comprehensive list of fruits, vegetables, and seeds in English and Tagalog
const validProducts = {
  fruits: [
    'apple', 'banana', 'orange', 'mango', 'grapes', 'strawberry', 'pineapple', 'watermelon',
    'papaya', 'guava', 'lemon', 'lime', 'coconut', 'avocado', 'kiwi', 'peach', 'pear',
    'plum', 'cherry', 'apricot', 'blueberry', 'raspberry', 'blackberry', 'cranberry',
    'pomegranate', 'fig', 'date', 'raisin', 'cantaloupe', 'honeydew', 'dragonfruit',
    'passionfruit', 'starfruit', 'lychee', 'rambutan', 'mangosteen', 'durian', 'jackfruit',
    'soursop', 'custard apple', 'sugar apple', 'breadfruit', 'tamarind', 'sapodilla',
    'longan', 'langsat', 'santol', 'atis', 'guyabano', 'chico', 'siniguelas', 'balimbing',
    'dalandan', 'suha', 'kalamansi', 'lanzones', 'macopa', 'tambis', 'duhat', 'aratiles',
    'bayabas', 'buko', 'niyog', 'saging', 'mangga', 'pinya', 'pakwan', 'melon',
    'ubas', 'mansanas', 'peras', 'grapefruit', 'tangerine', 'mandarin', 'clementine',
    'persimmon', 'elderberry', 'mulberry', 'gooseberry', 'currant', 'nectarine', 'yuzu',
    'macapuno', 'marang', 'sampalok', 'kamias', 'tiesa', 'kaymito', 'star apple',
    'cashew fruit', 'kasoy', 'lomboy', 'paho', 'tugui', 'seresa', 'siruela', 'melokoton',
    'aprikot', 'granada', 'igos', 'moras', 'pasas', 'prune', 'tuyong prutas', 'citrus'
  ],
  vegetables: [
    'tomato', 'onion', 'garlic', 'potato', 'carrot', 'cabbage', 'lettuce', 'spinach', 'kale',
    'broccoli', 'cauliflower', 'bell pepper', 'chili', 'eggplant', 'cucumber', 'zucchini',
    'squash', 'pumpkin', 'sweet potato', 'radish', 'turnip', 'beet', 'beetroot', 'celery',
    'asparagus', 'green beans', 'snap peas', 'snow peas', 'peas', 'corn', 'artichoke',
    'okra', 'bitter gourd', 'bottle gourd', 'snake gourd', 'ridge gourd', 'sponge gourd',
    'winter melon', 'chayote', 'green papaya', 'jackfruit', 'banana blossom', 'banana heart',
    'malunggay', 'moringa', 'kangkong', 'water spinach', 'pechay', 'bok choy', 'mustard greens',
    'collard greens', 'swiss chard', 'arugula', 'watercress', 'parsley', 'cilantro', 'coriander',
    'basil', 'mint', 'oregano', 'thyme', 'rosemary', 'sage', 'dill', 'fennel', 'leeks',
    'scallions', 'green onions', 'spring onions', 'shallots', 'ginger', 'turmeric', 'galangal',
    'lemongrass', 'mushroom', 'shiitake', 'oyster mushroom', 'enoki', 'button mushroom',
    'portobello', 'cremini', 'lima beans', 'black beans', 'kidney beans', 'chickpeas',
    'lentils', 'mung beans', 'black eyed peas', 'soybeans', 'tofu', 'tempeh', 'sprouts',
    'alfalfa', 'bean sprouts', 'mung bean sprouts', 'bamboo shoots', 'water chestnuts',
    'lotus root', 'taro', 'yam', 'cassava', 'jicama', 'kohlrabi', 'brussels sprouts',
    'rutabaga', 'parsnip', 'horseradish', 'daikon', 'napa cabbage', 'chinese cabbage',
    'romaine lettuce', 'iceberg lettuce', 'butter lettuce', 'red leaf lettuce', 'endive',
    'escarole', 'radicchio', 'frisee', 'mache', 'baby spinach', 'mature spinach',
    // Tagalog vegetables
    'kamatis', 'sibuyas', 'bawang', 'patatas', 'karot', 'repolyo', 'letsugas', 'alugbati',
    'kangkong', 'malunggay', 'pechay', 'mustasa', 'sili', 'talong', 'pipino', 'kalabasa',
    'kamote', 'labanos', 'singkamas', 'utong', 'kintsay', 'asparagus', 'sitaw',
    'sitsaro', 'gisantes', 'mais', 'artichoke', 'okra', 'ampalaya', 'upo', 'patola',
    'sayote', 'papaya', 'langka', 'puso ng saging', 'dahon ng saging', 'talbos ng kamote',
    'kulitis', 'saluyot', 'dahon ng sili', 'dahon ng kamatis', 'tanglad', 'luya', 'dilaw',
    'langkawas', 'kabute', 'tenga ng daga', 'patani', 'monggo', 'kadyos', 'bataw',
    'garbanzos', 'tokwa', 'tempeh', 'toge', 'talbos ng munggo', 'labong', 'apulid',
    'gabi', 'ube', 'kamoteng kahoy', 'kohlrabi', 'brussels sprouts', 'rutabaga',
    'parsnip', 'puting labanos', 'chinese cabbage', 'romaine', 'iceberg lettuce',
    'butter lettuce', 'pulang lettuce', 'endive', 'escarole', 'radicchio'
  ],
  seeds: [
    'sunflower seeds', 'pumpkin seeds', 'sesame seeds', 'chia seeds', 'flax seeds', 'hemp seeds',
    'poppy seeds', 'fennel seeds', 'coriander seeds', 'cumin seeds', 'mustard seeds',
    'nigella seeds', 'caraway seeds', 'anise seeds', 'dill seeds', 'celery seeds',
    'fenugreek seeds', 'cardamom seeds', 'watermelon seeds', 'papaya seeds', 'grape seeds',
    'apple seeds', 'tomato seeds', 'pepper seeds', 'chili seeds', 'cucumber seeds',
    'squash seeds', 'melon seeds', 'bean seeds', 'pea seeds', 'corn seeds', 'rice seeds',
    'wheat seeds', 'barley seeds', 'oat seeds', 'quinoa seeds', 'amaranth seeds',
    'buckwheat seeds', 'millet seeds', 'sorghum seeds', 'rye seeds', 'spelt seeds',
    'kamote seeds', 'malunggay seeds', 'okra seeds', 'eggplant seeds', 'kangkong seeds',
    'pechay seeds', 'lettuce seeds', 'spinach seeds', 'carrot seeds', 'radish seeds',
    'onion seeds', 'garlic seeds', 'basil seeds', 'mint seeds', 'oregano seeds',
    'thyme seeds', 'rosemary seeds', 'sage seeds', 'parsley seeds', 'cilantro seeds',
    // Tagalog seeds
    'buto ng mirasol', 'buto ng kalabasa', 'linga', 'buto ng amapola', 'buto ng haras',
    'buto ng wansoy', 'buto ng kumino', 'buto ng mustasa', 'buto ng nigella', 'buto ng caraway',
    'buto ng anise', 'buto ng dill', 'buto ng kintsay', 'buto ng fenugreek', 'buto ng cardamom',
    'buto ng pakwan', 'buto ng papaya', 'buto ng ubas', 'buto ng mansanas', 'buto ng kamatis',
    'buto ng paminta', 'buto ng sili', 'buto ng pipino', 'buto ng kalabasa', 'buto ng melon',
    'buto ng sitaw', 'buto ng gisantes', 'buto ng mais', 'buto ng bigas', 'buto ng trigo',
    'buto ng barley', 'buto ng oat', 'buto ng quinoa', 'buto ng amaranth', 'buto ng buckwheat',
    'buto ng millet', 'buto ng sorghum', 'buto ng rye', 'buto ng spelt', 'buto ng kamote',
    'buto ng malunggay', 'buto ng okra', 'buto ng talong', 'buto ng kangkong', 'buto ng pechay',
    'buto ng lettuce', 'buto ng spinach', 'buto ng karot', 'buto ng labanos', 'buto ng sibuyas',
    'buto ng bawang', 'buto ng balanoy', 'buto ng mint', 'buto ng oregano', 'buto ng thyme',
    'buto ng rosemary', 'buto ng sage', 'buto ng parsley', 'buto ng wansoy', 'binhi', 'tanim',
    'punla', 'buto'
  ]
};

// Fallback validation function
const fallbackValidation = (productName, productCategory) => {
  const productNameLower = productName.toLowerCase();
  let validProductsList = [];
  
  if (productCategory === 'fruits') {
    validProductsList = validProducts.fruits;
  } else if (productCategory === 'vegetables') {
    validProductsList = validProducts.vegetables;
  } else {
    validProductsList = [
      ...validProducts.fruits,
      ...validProducts.vegetables,
      ...validProducts.seeds
    ];
  }
  
  const isValidByKeyword = validProductsList.some(item => 
    productNameLower.includes(item.toLowerCase()) || 
    item.toLowerCase().includes(productNameLower)
  );

  return {
    isValid: isValidByKeyword,
    confidence: isValidByKeyword ? 0.8 : 0.1,
    message: isValidByKeyword ? 'Product name is valid' : 'Product name should be related to fruits, vegetables, or seeds'
  };
};

// Fallback content validation function
const fallbackContentValidation = (text) => {
  const inappropriateWords = [
    // Explicit content
    'penis', 'dick', 'cock', 'pussy', 'vagina', 'sex', 'fuck', 'shit', 'porn', 'nude', 'naked',
    'breast', 'boob', 'ass', 'butt', 'anal', 'oral', 'masturbat', 'orgasm', 'cum', 'sperm',
    // Violence/weapons
    'kill', 'murder', 'gun', 'knife', 'weapon', 'bomb', 'terror', 'violence', 'blood',
    // Drugs
    'drug', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'cannabis',
    // Tagalog inappropriate words
    'titi', 'puke', 'kantot', 'tamod', 'jakol', 'putang', 'gago', 'tangina', 'bobo',
    'ulol', 'pakyu', 'leche', 'punyeta', 'hudas', 'peste'
  ];
  
  const textLower = text.toLowerCase();
  const hasInappropriateContent = inappropriateWords.some(word => 
    textLower.includes(word.toLowerCase())
  );

  return {
    isAppropriate: !hasInappropriateContent,
    flagged: hasInappropriateContent,
    categories: hasInappropriateContent ? ['inappropriate-content'] : [],
    message: hasInappropriateContent ? 'Content contains inappropriate material' : 'Content appears appropriate'
  };
};

// Function to validate product name using Hugging Face
const validateProductWithHuggingFace = async (productName, productCategory) => {
  try {
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!HF_API_KEY) {
      console.warn('Hugging Face API key not found, using fallback validation');
      return fallbackValidation(productName, productCategory);
    }
    
    // Create a comprehensive list of valid products based on category
    let validProductsList = [];
    
    if (productCategory === 'fruits') {
      validProductsList = validProducts.fruits;
    } else if (productCategory === 'vegetables') {
      validProductsList = validProducts.vegetables;
    } else {
      // If no specific category, check all
      validProductsList = [
        ...validProducts.fruits,
        ...validProducts.vegetables,
        ...validProducts.seeds
      ];
    }

    // First, do a simple keyword check
    const productNameLower = productName.toLowerCase();
    const isValidByKeyword = validProductsList.some(item => 
      productNameLower.includes(item.toLowerCase()) || 
      item.toLowerCase().includes(productNameLower)
    );

    if (isValidByKeyword) {
      return { isValid: true, confidence: 0.9, message: 'Product name is valid' };
    }

    // If keyword check fails, use Hugging Face for semantic similarity
    const response = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            source_sentence: productName,
            sentences: validProductsList.slice(0, 50) // Limit to avoid API limits
          }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const maxSimilarity = Math.max(...data);
        const isValid = maxSimilarity > 0.7; // Threshold for similarity
        
        return {
          isValid,
          confidence: maxSimilarity,
          message: isValid ? 'Product name is valid' : 'Product name should be related to fruits, vegetables, or seeds'
        };
      }
    }

    // Fallback to keyword validation
    return {
      isValid: false,
      confidence: 0.1,
      message: 'Product name should be related to fruits, vegetables, or seeds'
    };

  } catch (error) {
    console.error('Hugging Face API error:', error);
    return fallbackValidation(productName, productCategory);
  }
};

// Function to validate content using OpenAI Moderation
const validateContentWithOpenAI = async (text) => {
  try {
    // First check with fallback for immediate catching of obvious inappropriate content
    const fallbackCheck = fallbackContentValidation(text);
    if (!fallbackCheck.isAppropriate) {
      console.log('Fallback validation caught inappropriate content:', text);
      return fallbackCheck;
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using fallback validation');
      return fallbackCheck;
    }
    
    console.log('Validating content with OpenAI:', text);
    
    const response = await fetch(
      'https://api.openai.com/v1/moderations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('OpenAI moderation response:', data);
      
      const moderation = data.results[0];
      
      if (moderation.flagged) {
        const flaggedCategories = Object.entries(moderation.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => category);
        
        return {
          isAppropriate: false,
          flagged: true,
          categories: flaggedCategories,
          message: `Content flagged for: ${flaggedCategories.join(', ')}`
        };
      }

      return {
        isAppropriate: true,
        flagged: false,
        categories: [],
        message: 'Content is appropriate'
      };
    } else {
      console.warn('OpenAI API request failed:', response.status, await response.text());
    }

    return fallbackCheck;

  } catch (error) {
    console.error('OpenAI Moderation API error:', error);
    // Use fallback validation as backup
    return fallbackContentValidation(text);
  }
};

// Main validation function
const validateProductContent = async (productName, productDescription, productCategory) => {
  try {
    console.log('Starting product validation for:', productName);
    
    // Validate product name with Hugging Face
    const nameValidation = await validateProductWithHuggingFace(productName, productCategory);
    
    // Validate content appropriateness with OpenAI
    const nameModeration = await validateContentWithOpenAI(productName);
    const descriptionModeration = await validateContentWithOpenAI(productDescription);

    console.log('Validation results:', {
      nameValid: nameValidation.isValid,
      nameAppropriate: nameModeration.isAppropriate,
      descriptionAppropriate: descriptionModeration.isAppropriate
    });

    // Determine if product should be soft deleted
    // Product should be soft deleted if:
    // 1. Name is not valid (not related to fruits/vegetables/seeds) OR
    // 2. Name contains inappropriate content OR  
    // 3. Description contains inappropriate content
    const shouldSoftDelete = !nameValidation.isValid || !nameModeration.isAppropriate || !descriptionModeration.isAppropriate;
    
    let deletionReason = null;
    if (!nameValidation.isValid) {
      deletionReason = 'inappropriate_content'; // Not related to fruits/vegetables/seeds
    } else if (!nameModeration.isAppropriate || !descriptionModeration.isAppropriate) {
      deletionReason = 'inappropriate_content'; // Flagged by OpenAI moderation
    }

    console.log('Final validation decision:', {
      shouldSoftDelete,
      deletionReason
    });

    return {
      nameValidation,
      nameModeration,
      descriptionModeration,
      shouldSoftDelete,
      deletionReason,
      validatedAt: new Date()
    };

  } catch (error) {
    console.error('Product validation error:', error);
    
    // Return safe defaults if validation fails - don't soft delete on error
    return {
      nameValidation: { isValid: true, confidence: 0.5, message: 'Validation service unavailable' },
      nameModeration: { isAppropriate: true, flagged: false, categories: [], message: 'Moderation service unavailable' },
      descriptionModeration: { isAppropriate: true, flagged: false, categories: [], message: 'Moderation service unavailable' },
      shouldSoftDelete: false,
      deletionReason: null,
      validatedAt: new Date()
    };
  }
};

module.exports = {
  validateProductContent,
  validateProductWithHuggingFace,
  validateContentWithOpenAI,
  validProducts
};

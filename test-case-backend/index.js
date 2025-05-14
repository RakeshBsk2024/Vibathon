const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;
const GEMINI_API_KEY = 'AIzaSyBxuekaI-oDv8MnjhbM_1l-eRbp2FCjpiA'; // Replace with your Gemini API key

app.use(cors()); // Enable CORS to allow requests from your extension
app.use(express.json());

// Function to generate a structured prompt for test case generation
function generateTestCasePrompt(elements) {
  // Count unique button labels
  const buttonLabels = {};
  const inputElements = [];
  
  elements.forEach(element => {
    if (element.type === 'button') {
      if (!buttonLabels[element.label]) {
        buttonLabels[element.label] = 0;
      }
      buttonLabels[element.label]++;
    } else if (element.type === 'input') {
      inputElements.push(element);
    }
  });
  
  // Create a summary of the UI elements
  const buttonSummary = Object.entries(buttonLabels)
    .map(([label, count]) => `${count} "${label}" button${count > 1 ? 's' : ''}`)
    .join(', ');
  
  const inputSummary = inputElements.length > 0 
    ? `${inputElements.length} input field${inputElements.length > 1 ? 's' : ''} (${inputElements.map(i => i.label).join(', ')})` 
    : 'no input fields';
  
  // Create the prompt
  return `Generate comprehensive test cases for a web page with the following UI elements: ${buttonSummary}, and ${inputSummary}.

Based on these elements, it appears to be a case management interface where users can view, review, or remind themselves about cases.

Please generate at least 10 test cases that cover the following scenarios:
1. Functionality testing of each button type
2. Navigation flows between different actions
3. Edge cases and error handling
4. User interaction patterns

Each test case should include:
- id: A unique identifier
- title: A descriptive title
- description: What the test is verifying
- steps: Array of steps to execute the test
- expected_result: What should happen when the test passes
- priority: 'high', 'medium', or 'low'

IMPORTANT: You must ONLY return a raw JSON array with no markdown formatting, no code blocks or markdown (), and no explanatory text before or after. Do not wrap the response in quotes. It should be a parseable JSON array and be directly parseable as JSON. Format example:

[
  {
    "id": "TC001",
    "title": "Verify View All Cases button navigation",
    "description": "Test that clicking the View All Cases button navigates to the cases overview page",
    "steps": [
      "Navigate to the main dashboard",
      "Click on the 'View All Cases' button"
    ],
    "expected_result": "User is redirected to the cases overview page showing all available cases",
    "priority": "high"
  }
]
  
`;
}

// Endpoint for generating test cases
app.post('/generate-test-cases', async (req, res) => {
  console.log("Request Body:", JSON.stringify(req.body));
  
  // Extract elements from the request body
  const { elements } = req.body;
  
  if (!elements || !Array.isArray(elements)) {
    console.error("Invalid request: elements array is missing or not an array");
    return res.status(400).json({ error: 'Invalid request: elements array is required' });
  }
  
  // Group elements by type and label for analysis
  const elementsByType = {};
  elements.forEach(element => {
    if (!elementsByType[element.type]) {
      elementsByType[element.type] = [];
    }
    elementsByType[element.type].push(element);
  });
  
  console.log("Elements by type:", JSON.stringify(elementsByType, null, 2));
  
  // Generate a structured prompt for the AI
  const prompt = generateTestCasePrompt(elements);
  console.log("Generated prompt:", prompt);
  
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined");
    return res.status(500).json({ error: 'API key is missing' });
  }
  
  try {
    console.log("Making request to Gemini API...");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log("API URL:", apiUrl.replace(GEMINI_API_KEY, "[REDACTED]"));
    
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };
    
    console.log("Request payload:", JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(apiUrl, requestBody);
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    console.log("Response data structure:", JSON.stringify(Object.keys(response.data), null, 2));
    
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Generated text: ", generatedText);
    console.log("Generated text type: ", typeof generatedText);
    console.log("Parsed JSON: ", JSON.parse(generatedText.replace(/```json\n|```\n|```json|```/g, '')));
    // Try to parse the generated text as JSON
    let testCases;
    try {
      // Remove any markdown code block formatting if present
      // let cleanedText = generatedText;
      // if (generatedText.includes('```')) {
      //   cleanedText = generatedText.replace(/```json\n|```\n|```json|```/g, '');
      // }
      // Trim any whitespace
      // cleanedText = cleanedText.trim();
      let parsedText = JSON.parse(generatedText.replace(/```json\n|```\n|```json|```/g, ''));
      testCases = parsedText;
    } catch (error) {
      console.error("Failed to parse JSON response:", error.message);
      console.error("Raw text received:", generatedText);
      testCases = generatedText; // Fallback to raw text if parsing fails
    }

    if (generatedText) {
      console.log("Successfully generated test cases");
      res.json({ testCases });
    } else {
      console.error("No test cases in response:", JSON.stringify(response.data, null, 2));
      res.status(500).json({ error: 'No test cases returned from Gemini' });
    }
  } catch (err) {
    console.error("Error calling Gemini API:", err.message);
    console.error("Error details:", err.response?.data || "No detailed error information");
    console.error("Error status:", err.response?.status || "No status code");
    res.status(500).json({ 
      error: 'Failed to generate test cases', 
      details: err.response?.data || err.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Gemini backend is running at http://localhost:${PORT}`);
});


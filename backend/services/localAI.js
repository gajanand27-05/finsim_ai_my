async function askLocalAI(prompt, model = 'llama3') {
  try {
    console.log(`[Ollama] Routing chat inference to local model: ${model}`);
    
    // Using global fetch (Requires Node.js v18+)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
       throw new Error(`Ollama API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('[Ollama Fallback] Could not connect to localhost:11434.', error.message);
    return "Local AI is currently offline. Please ensure Ollama is running and the model is pulled locally!";
  }
}

module.exports = { askLocalAI };

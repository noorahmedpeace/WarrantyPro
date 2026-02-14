const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            console.warn('⚠️ GEMINI_API_KEY is missing. AI features will not work.');
        }
        this.model = 'gemini-1.5-flash';
    }

    /**
     * Generate AI diagnostic conversation response
     * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: string}
     * @param {Object} warrantyContext - Warranty details for context
     * @returns {Promise<string>} AI response
     */
    async getDiagnosticResponse(conversationHistory, warrantyContext) {
        if (!this.genAI) {
            throw new Error('AI service is not configured (missing GEMINI_API_KEY)');
        }
        try {
            const systemPrompt = this.buildDiagnosticSystemPrompt(warrantyContext);

            // Convert conversation to Gemini format
            const geminiModel = this.genAI.getGenerativeModel({
                model: this.model,
                systemInstruction: systemPrompt // Use native system instruction for 1.5 models
            });

            // Build conversation history (excluding the current user message)
            const history = conversationHistory.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const chat = geminiModel.startChat({
                history: history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            });

            // Get last user message
            const lastMessage = conversationHistory[conversationHistory.length - 1];

            const result = await chat.sendMessage(lastMessage.content);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('[AI Service] Diagnostic error:', error.message, error.stack);
            throw new Error(`AI response failed: ${error.message}`);
        }
    }

    /**
     * Build system prompt for diagnostic chatbot
     */
    buildDiagnosticSystemPrompt(warranty) {
        const { product_name, brand, categoryId, purchase_date, warranty_duration_months } = warranty;

        return `You are a helpful warranty claim assistant for WarrantyPro. You're helping a user diagnose an issue with their product.

Product Details:
- Product: ${product_name}
- Brand: ${brand}
- Category: ${categoryId || 'General'}
- Purchase Date: ${purchase_date}
- Warranty Duration: ${warranty_duration_months} months

Your role:
1. Ask clarifying questions to understand the issue
2. Suggest troubleshooting steps appropriate for the product type
3. Determine if the issue is covered under warranty
4. Assess severity (minor, moderate, severe)
5. Guide user toward filing a claim if needed

Guidelines:
- Be empathetic and professional
- Ask one question at a time
- Provide specific, actionable troubleshooting steps
- If the issue seems warranty-covered, recommend filing a claim
- Keep responses concise (2-3 sentences max)
- Use simple, non-technical language

Current conversation context: The user is describing an issue with their ${product_name}.`;
    }

    /**
     * Generate professional claim email
     * @param {Object} claimData - Claim details
     * @returns {Promise<Object>} {subject, body, severity}
     */
    async generateClaimEmail(claimData) {
        if (!this.genAI) {
            throw new Error('AI service is not configured (missing GEMINI_API_KEY)');
        }
        try {
            const { warranty, issueDescription, troubleshootingSteps, conversationSummary, userInfo } = claimData;

            const prompt = `Generate a professional warranty claim email based on the following information:

Product: ${warranty.product_name}
Brand: ${warranty.brand}
Serial Number: ${warranty.serial_number || 'N/A'}
Purchase Date: ${new Date(warranty.purchase_date).toLocaleDateString()}
Warranty Duration: ${warranty.warranty_duration_months} months
Retailer: ${warranty.retailer || 'N/A'}

Issue Description:
${issueDescription}

Troubleshooting Steps Attempted:
${troubleshootingSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Conversation Summary:
${conversationSummary}

User Information:
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone || 'N/A'}

Generate a professional email with:
1. A clear subject line
2. A complete email body that:
   - Is polite and professional
   - Clearly describes the issue
   - Lists troubleshooting attempts
   - Requests warranty service/replacement
   - Includes all relevant product details
   - Mentions attached documents (receipt, photos)
   - Ends with a call to action

Also assess the severity as "low", "medium", or "high".

Respond in this exact JSON format:
{
  "subject": "your subject line here",
  "body": "your email body here",
  "severity": "low or medium or high"
}`;

            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response (Gemini sometimes adds markdown)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return {
                subject: parsed.subject,
                body: parsed.body,
                severity: parsed.severity || 'medium'
            };
        } catch (error) {
            console.error('Email generation error:', error);
            throw new Error('Failed to generate claim email');
        }
    }

    /**
     * Analyze issue severity
     * @param {string} issueDescription
     * @param {Array} conversationHistory
     * @returns {Promise<Object>} {severity, reasoning, recommendClaim}
     */
    async analyzeIssueSeverity(issueDescription, conversationHistory) {
        if (!this.genAI) return { severity: 'medium', recommendClaim: true, reasoning: 'AI not configured' };
        try {
            const prompt = `Analyze the severity of this product issue:

Issue: ${issueDescription}

Conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Determine:
1. Severity level (low, medium, high)
2. Whether this warrants a warranty claim
3. Brief reasoning

Respond in this exact JSON format:
{
  "severity": "low or medium or high",
  "recommendClaim": true or false,
  "reasoning": "your reasoning here"
}`;

            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    severity: 'medium',
                    recommendClaim: true,
                    reasoning: 'Unable to analyze severity automatically'
                };
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Severity analysis error:', error);
            return {
                severity: 'medium',
                recommendClaim: true,
                reasoning: 'Unable to analyze severity automatically'
            };
        }
    }

    /**
     * Generate troubleshooting suggestions
     * @param {string} productCategory
     * @param {string} issueDescription
     * @returns {Promise<Array<string>>} Array of troubleshooting steps
     */
    async generateTroubleshootingSteps(productCategory, issueDescription) {
        if (!this.genAI) return this.getDefaultTroubleshootingSteps();
        try {
            const prompt = `Generate 3-5 troubleshooting steps for this issue:

Product Category: ${productCategory}
Issue: ${issueDescription}

Provide practical, safe troubleshooting steps that a non-technical user can perform.
Respond with a JSON object containing a "steps" array: {"steps": ["step 1", "step 2", ...]}`;

            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return this.getDefaultTroubleshootingSteps();
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.steps || this.getDefaultTroubleshootingSteps();
        } catch (error) {
            console.error('Troubleshooting generation error:', error);
            return this.getDefaultTroubleshootingSteps();
        }
    }

    getDefaultTroubleshootingSteps() {
        return [
            'Check if the device is properly powered on',
            'Restart the device',
            'Check for any visible damage',
            'Consult the user manual for specific troubleshooting'
        ];
    }
}

module.exports = new AIService();

const OpenAI = require('openai');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.model = 'gpt-4-turbo-preview';
    }

    /**
     * Generate AI diagnostic conversation response
     * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: string}
     * @param {Object} warrantyContext - Warranty details for context
     * @returns {Promise<string>} AI response
     */
    async getDiagnosticResponse(conversationHistory, warrantyContext) {
        try {
            const systemPrompt = this.buildDiagnosticSystemPrompt(warrantyContext);

            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory
            ];

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('AI diagnostic error:', error);
            throw new Error('Failed to generate AI response');
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

Generate:
1. A professional email subject line
2. A complete email body that:
   - Is polite and professional
   - Clearly describes the issue
   - Lists troubleshooting attempts
   - Requests warranty service/replacement
   - Includes all relevant product details
   - Mentions attached documents (receipt, photos)
   - Ends with a call to action

Format the response as JSON:
{
  "subject": "...",
  "body": "...",
  "severity": "low|medium|high"
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert at writing professional warranty claim emails. Always respond with valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 800,
                response_format: { type: 'json_object' }
            });

            const result = JSON.parse(response.choices[0].message.content);
            return result;
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
        try {
            const prompt = `Analyze the severity of this product issue:

Issue: ${issueDescription}

Conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Determine:
1. Severity level (low, medium, high)
2. Whether this warrants a warranty claim
3. Brief reasoning

Respond in JSON format:
{
  "severity": "low|medium|high",
  "recommendClaim": true|false,
  "reasoning": "..."
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert at assessing product issues. Always respond with valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 200,
                response_format: { type: 'json_object' }
            });

            return JSON.parse(response.choices[0].message.content);
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
        try {
            const prompt = `Generate 3-5 troubleshooting steps for this issue:

Product Category: ${productCategory}
Issue: ${issueDescription}

Provide practical, safe troubleshooting steps that a non-technical user can perform.
Respond as a JSON array of strings: ["step 1", "step 2", ...]`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a technical support expert. Always respond with valid JSON array.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 300,
                response_format: { type: 'json_object' }
            });

            const result = JSON.parse(response.choices[0].message.content);
            return result.steps || [];
        } catch (error) {
            console.error('Troubleshooting generation error:', error);
            return [
                'Check if the device is properly powered on',
                'Restart the device',
                'Check for any visible damage',
                'Consult the user manual for specific troubleshooting'
            ];
        }
    }
}

module.exports = new AIService();

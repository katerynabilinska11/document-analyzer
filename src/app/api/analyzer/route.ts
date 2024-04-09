import { OpenAIClient } from "@langchain/openai";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request, res: Response) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }


  try {
    // @ts-ignore
    const buffer = Buffer.from(await file.arrayBuffer());
    // @ts-ignore
    const fileExt = path.extname(file.name).toLowerCase();
    if (fileExt !== '.txt') 
      throw new Error('Unsupported file format');

    const content = JSON.stringify(buffer.toString('utf-8'));

    const analysisService = new LangchainAnalysisService();
    const response = await analysisService.openAISummary(content);

    return NextResponse.json(response.text);
  } catch (error) {
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
}

class LangchainAnalysisService {
  async summarizeText (text:string) {
      const openai = new OpenAIClient({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
      try {
        const chatCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an AI trained to analyze initial project desctiption. Your job is to identify and summarize the functionalities and give an overview of the client's business and project request.`,
            },
            {
              role: "user",
              content: `
                      - Use a conversational but professional tone throughout the summary.
                      - Stick strictly to the content provided within the project desription without adding any information not explicitly stated.
                      - Follow the structure provided in the example, but do not use the content from the example.
                      - Your summary should be comprehensive enough to inform developers about the project and features that should be implemented.
                      - Questions should have question mark at the end.
                      - Please use markdown for formatting.
                      - Features may contains subfeatures and each subfeature should be listed with a bullet points.
                      

                      Example: Here is an example of a summary that follows the structure outlined above. DO NOT USE any of the content from this example in your response. DO NOT evaluate this example summary in your response. Only use the structure as a guide for your response.
                      
                      **1. Summary:**
                      The client is seeking the development of an interview management application utilizing Angular for the frontend, .Net Core for the backend, and MSSQL for the database. The application will encompass role management, authorization, authentication, and candidate management functionalities.
                      
                      **2. Features:**
                      - Role management system
                        - create role
                        - assign role
                        - manage permission
                      - Authorization
                        - sign in
                        - sign up
                      - Candidate management
                        - manage personal details
                        - upload resume
                        - track status
                      - Interview functionalities
                        - schedule interview
                        - set reminder
                        - review results
                      
                      **3. Questions:** 
                      - What are the specific requirements for the role management system functionalities?
                      - Are there any integration details for Google Sign-In authentication?
                      - Are there any customization needs for candidate management features?
                      
                      **4. Missed features:**
                      - Detailed information on the interview management process.
                      - Specific UI/UX requirements for the frontend.
                      - Integration with third-party services for additional functionalities.
                      
                      If you're unable to generate a summary, tell me why. Do not use information in any examples given. Do not make reference to any additional context outside of the content provided in your response. Your summary should be detailed enough to bring someone up to speed if they haven't read the whole project desription. You'll get a $100 tip for aheading to the structure used in the example.`,
            },
            { role: "assistant", content: "Please provide me the text you want to summarize." },
            { role: "user", content: text },
          ],
          max_tokens: 3000,
          temperature: 0.5,
          top_p: 1,
        });
        return chatCompletion.choices[0].message.content;
      } catch (error) {
        throw error;
      }
  }

  async summarizeSummaries (summaries:string[]) {
      const textChunk = summaries.join(' ');
      return this.summarizeText(textChunk);
  }

  
  chunkText = (text:string, chunkSize:number) => {
      const words = text.split(/\s+/); // split by whitespace
      const chunks = [];

      for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ');
          chunks.push(chunk);
      }
      
      return chunks;
  }

  async openAISummary (content:string) {
      const chunks = this.chunkText(content, 400);
      const summariesPromises = chunks.map(chunk => this.summarizeText(chunk));
      const summaries = await Promise.all(summariesPromises);
      // @ts-ignore
      const finalSummary = {text: await this.summarizeSummaries(summaries.filter(s => s))};
      return finalSummary;
  }
}

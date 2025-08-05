
'use server';

/**
 * @fileOverview An AI-powered site analyzer that reviews the entire codebase
 * and provides feedback and suggestions.
 *
 * - analyzeSite - A function that triggers the site analysis.
 * - SiteAnalyzerInput - The input type for the analyzeSite function.
 * - SiteAnalyzerOutput - The return type for the analyzeSite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define the input schema, which will be a string containing all file contents.
const SiteAnalyzerInputSchema = z.object({
  context: z.string().describe('A string containing the paths and content of all project files.'),
});
export type SiteAnalyzerInput = z.infer<typeof SiteAnalyzerInputSchema>;

// Define the output schema, which will be a string containing the analysis.
const SiteAnalyzerOutputSchema = z.object({
  analysis: z.string().describe('The detailed analysis and suggestions for the site code.'),
});
export type SiteAnalyzerOutput = z.infer<typeof SiteAnalyzerOutputSchema>;

// This function will read all files and return their content as a single string.
async function getProjectContext(): Promise<string> {
  const projectRoot = process.cwd();
  const filesToRead: string[] = [];
  const excludedDirs = ['node_modules', '.next', '.firebase', 'dist', 'build', '.vercel', '.vscode'];

  async function readDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!excludedDirs.includes(entry.name) && !entry.name.startsWith('.')) {
          await readDirectory(fullPath);
        }
      } else {
         if (/\.(tsx|ts|js|jsx|json|css|md|yaml)$/.test(entry.name)) {
           filesToRead.push(fullPath);
         }
      }
    }
  }

  await readDirectory(projectRoot);

  let contextString = 'Here is the full context of the project files:\n\n';
  for (const file of filesToRead) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const relativePath = path.relative(projectRoot, file);
      contextString += `--- FILE: ${relativePath} ---\n\n${content}\n\n`;
    } catch (e) {
        console.warn(`Could not read file ${file}, skipping.`)
    }
  }

  return contextString;
}


export async function analyzeSite(): Promise<SiteAnalyzerOutput> {
  console.log("Starting site analysis...");
  const projectContext = await getProjectContext();
  const input = { context: projectContext };
  const result = await siteAnalyzerFlow(input);
  console.log("Site analysis complete.");
  return result;
}

const prompt = ai.definePrompt({
  name: 'siteAnalyzerPrompt',
  input: {schema: SiteAnalyzerInputSchema},
  output: {schema: SiteAnalyzerOutputSchema},
  prompt: `You are an expert senior software developer and a specialist in Next.js, React, and Firebase.
You will be given the entire codebase of a project, with each file's path and content provided.

Your task is to perform a thorough code review and analysis. Identify potential bugs, logical errors, performance issues, and suggest improvements.
Pay close attention to the user's recent issues, such as problems with data editing and state management.

Provide a clear, concise, and actionable report in Markdown format. Structure your report with:
1.  A brief summary of the project's health.
2.  A "Critical Issues" section for any bugs or logical errors you find. For each issue, describe the problem, the file(s) involved, and a clear suggestion for how to fix it.
3.  A "Suggestions for Improvement" section for things like performance optimization, code structure, best practices, etc.

Analyze the following project context:

{{{context}}}
`,
});

const siteAnalyzerFlow = ai.defineFlow(
  {
    name: 'siteAnalyzerFlow',
    inputSchema: SiteAnalyzerInputSchema,
    outputSchema: SiteAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

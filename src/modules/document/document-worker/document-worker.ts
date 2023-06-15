import { getLoader } from "./get-loader";
import { TextSplitter } from "./text-splitter";


export async function loadAndSplit(file: Express.Multer.File): Promise<string[]> {
  const text = await getLoader(file.mimetype).load(file.buffer);
  return split(text);
}

export async function split(text: string): Promise<string[]> {
  let splitter = new TextSplitter();
  const chunks = await splitter.split(text);
  return chunks;
};

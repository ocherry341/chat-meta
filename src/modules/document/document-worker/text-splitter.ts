/*
Modified from langchainjs 0.0.92
https://github.com/hwchase17/langchainjs
Commit: 4d55d1e 

Original license:
The MIT License

Copyright (c) Harrison Chase

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { encode } from "gpt-3-encoder";

export interface TextSplitterOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  chunkHeader?: string;
}

export class TextSplitter {
  constructor(options?: TextSplitterOptions) {
    if (options) {
      this.chunkSize = options.chunkSize || 450;
      this.chunkOverlap = options.chunkOverlap || 100;
      this.chunkHeader = options.chunkHeader || '';
    }
    this.chunkHeaderLength = this.getLength(this.chunkHeader);
  }

  private readonly separators: string[] = [
    "\n\n",
    "\n",
    " ",
    "",
  ];

  private chunkSize: number = 450;
  private chunkOverlap: number = 100;
  private chunkHeader: string = "";
  private chunkHeaderLength: number = 0;

  private getLength(s: string): number {
    return encode(s).length;
  }

  private joinDocs(docs: string[], separator: string): string | null {
    const text = docs.join(separator).trim();
    return text === "" ? null : text;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: { str: string, len: number; }[] = [];
    const sepLength = this.getLength(separator);
    let total = 0;
    for (const d of splits) {
      const _len = this.getLength(d) + this.chunkHeaderLength;
      if (
        total + _len + (currentDoc.length > 0 ? sepLength : 0) >
        this.chunkSize
      ) {
        if (total > this.chunkSize) {
          console.warn(
            `Created a chunk of size ${total}, which is longer than the specified ${this.chunkSize}`
          );
        }
        if (currentDoc.length > 0) {
          const doc = this.joinDocs(currentDoc.map(c => c.str), separator);
          if (doc !== null) {
            docs.push(this.chunkHeader + doc);
          }
          // Keep on popping if:
          // - we have a larger chunk than in the chunk overlap
          // - or if we still have any chunks and the length is long
          while (
            total > this.chunkOverlap ||
            (total + _len > this.chunkSize && total > 0)
          ) {
            total -= currentDoc[0].len;
            currentDoc.shift();
          }
        }
      }
      currentDoc.push({ str: d, len: _len });
      total += _len;
    }
    const doc = this.joinDocs(currentDoc.map(c => c.str), separator);
    if (doc !== null) {
      docs.push(this.chunkHeader + doc);
    }
    return docs;
  }

  async split(text: string, header?: string): Promise<string[]> {
    if (header) {
      this.chunkHeader = header;
      this.chunkHeaderLength = this.getLength(this.chunkHeader);
    }

    const finalChunks: string[] = [];

    // Get appropriate separator to use
    let separator: string = this.separators[this.separators.length - 1];
    for (const s of this.separators) {
      if (s === "") {
        separator = s;
        break;
      }
      if (text.includes(s)) {
        separator = s;
        break;
      }
    }

    // Now that we have the separator, split the text
    let splits: string[];
    if (separator) {
      splits = text.split(separator);
    } else {
      splits = text.split("");
    }

    // Now go merging things, recursively splitting longer texts.
    let goodSplits: string[] = [];
    for (const s of splits) {
      if (this.getLength(s) < this.chunkSize) {
        goodSplits.push(s);
      } else {
        if (goodSplits.length) {
          const mergedText = this.mergeSplits(goodSplits, separator);
          finalChunks.push(...mergedText);
          goodSplits = [];
        }
        const otherInfo = await this.split(s);
        finalChunks.push(...otherInfo);
      }
    }
    if (goodSplits.length) {
      const mergedText = this.mergeSplits(goodSplits, separator);
      finalChunks.push(...mergedText);
    }
    return finalChunks;
  }
}
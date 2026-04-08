import EventEmitter from 'node:events';
import { createReadStream } from 'node:fs';
import { FileReader } from './file-reader.interface.js';

const CHUNK_SIZE = 16384; // 16KB

export class TSVFileReader extends EventEmitter implements FileReader {
  constructor(private readonly filename: string) {
    super();
  }

  public async read(): Promise<void> {
    const readStream = createReadStream(this.filename, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let remainingData = '';
    let nextLinePosition = -1;
    let importedRowCount = 0;
    let isFirstLine = true;

    try {
      for await (const chunk of readStream) {
        remainingData += chunk;

        while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
          const completeRow = remainingData.slice(0, nextLinePosition + 1);
          remainingData = remainingData.slice(++nextLinePosition);

          if (isFirstLine) {
            isFirstLine = false;
            continue;
          }

          importedRowCount++;
          await new Promise<void>((resolve) => {
            this.emit('line', completeRow.trim(), resolve);
          });
        }
      }

      this.emit('end', importedRowCount);
    } catch (error) {
      console.error(`Error reading file: ${this.filename}`);
      throw error;
    }
  }
}

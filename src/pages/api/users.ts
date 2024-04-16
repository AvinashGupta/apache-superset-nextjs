import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Data = {
  [key: string]: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const jsonData = fs.readFileSync(
      path.join(process.cwd(), 'data', 'users.json'),
      'utf-8'
    );
    const data = JSON.parse(jsonData);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

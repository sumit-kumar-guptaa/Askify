import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'OK',
    message: 'Next.js API is running'
  });
}

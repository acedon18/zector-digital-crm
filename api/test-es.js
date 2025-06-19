// ES Module test endpoint
export default function handler(req, res) {
  res.status(200).json({ message: 'API test endpoint working with ES modules' });
}

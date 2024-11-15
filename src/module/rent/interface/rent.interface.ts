interface Equipment {
    category: string;
    items: string[];
}

interface CustomRequest extends Request {
    user: {
      id: string;
      name: string;
      [key: string]: any;
    };
}
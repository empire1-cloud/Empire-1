const subscribers = new Map();

export const emit = (event, data) => {
  const handlers = subscribers.get(event) || [];
  handlers.forEach(handler => handler(data));
};

export const subscribe = (event, handler) => {
  if (!subscribers.has(event)) {
    subscribers.set(event, []);
  }
  subscribers.get(event).push(handler);
  
  return () => {
    const handlers = subscribers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  };
};

export const unsubscribe = (event, handler) => {
  const handlers = subscribers.get(event);
  if (handlers) {
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }
};

import { MockChatService } from './chatService';

describe('MockChatService', () => {
  let service: MockChatService;

  beforeEach(() => {
    service = new MockChatService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sendMessage returns a response after delay', async () => {
    const promise = service.sendMessage('Hello');

    jest.advanceTimersByTime(1000);
    
    const response = await promise;
    
    expect(response).toEqual(expect.objectContaining({
      role: 'assistant',
      content: expect.stringContaining('Hello'),
      timestamp: expect.any(Date),
    }));
  });

  it('generates unique IDs', async () => {
    const promise1 = service.sendMessage('1');
    jest.advanceTimersByTime(1000);
    const response1 = await promise1;

    const promise2 = service.sendMessage('2');
    jest.advanceTimersByTime(1000);
    const response2 = await promise2;

    expect(response1.id).not.toBe(response2.id);
  });
});

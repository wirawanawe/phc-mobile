import { getTimeBasedGreeting, getTimeBasedGreetingEnglish } from './greetingUtils';

// Mock Date to test different times
const mockDate = (hour: number) => {
  const originalDate = global.Date;
  global.Date = class extends Date {
    constructor() {
      super();
    }
    getHours() {
      return hour;
    }
  } as any;
  
  return () => {
    global.Date = originalDate;
  };
};

describe('getTimeBasedGreeting', () => {
  test('should return "Selamat Pagi" for morning hours (5-11)', () => {
    const restoreDate = mockDate(8);
    const greeting = getTimeBasedGreeting();
    expect(greeting.text).toBe('Selamat Pagi');
    expect(greeting.icon).toBe('weather-sunny');
    expect(greeting.color).toBe('#D69E2E');
    restoreDate();
  });

  test('should return "Selamat Siang" for noon hours (12-14)', () => {
    const restoreDate = mockDate(13);
    const greeting = getTimeBasedGreeting();
    expect(greeting.text).toBe('Selamat Siang');
    expect(greeting.icon).toBe('weather-sunny');
    expect(greeting.color).toBe('#D69E2E');
    restoreDate();
  });

  test('should return "Selamat Sore" for afternoon hours (15-17)', () => {
    const restoreDate = mockDate(16);
    const greeting = getTimeBasedGreeting();
    expect(greeting.text).toBe('Selamat Sore');
    expect(greeting.icon).toBe('weather-partly-cloudy');
    expect(greeting.color).toBe('#E53E3E');
    restoreDate();
  });

  test('should return "Selamat Malam" for evening hours (18-21)', () => {
    const restoreDate = mockDate(20);
    const greeting = getTimeBasedGreeting();
    expect(greeting.text).toBe('Selamat Malam');
    expect(greeting.icon).toBe('weather-night');
    expect(greeting.color).toBe('#9F7AEA');
    restoreDate();
  });

  test('should return "Selamat Malam" for late night hours (22-4)', () => {
    const restoreDate = mockDate(23);
    const greeting = getTimeBasedGreeting();
    expect(greeting.text).toBe('Selamat Malam');
    expect(greeting.icon).toBe('weather-night');
    expect(greeting.color).toBe('#9F7AEA');
    restoreDate();
  });
});

describe('getTimeBasedGreetingEnglish', () => {
  test('should return "Good Morning" for morning hours (5-11)', () => {
    const restoreDate = mockDate(8);
    const greeting = getTimeBasedGreetingEnglish();
    expect(greeting.text).toBe('Good Morning');
    expect(greeting.icon).toBe('weather-sunny');
    expect(greeting.color).toBe('#D69E2E');
    restoreDate();
  });

  test('should return "Good Afternoon" for afternoon hours (12-16)', () => {
    const restoreDate = mockDate(14);
    const greeting = getTimeBasedGreetingEnglish();
    expect(greeting.text).toBe('Good Afternoon');
    expect(greeting.icon).toBe('weather-sunny');
    expect(greeting.color).toBe('#D69E2E');
    restoreDate();
  });

  test('should return "Good Evening" for evening hours (17-21)', () => {
    const restoreDate = mockDate(19);
    const greeting = getTimeBasedGreetingEnglish();
    expect(greeting.text).toBe('Good Evening');
    expect(greeting.icon).toBe('weather-partly-cloudy');
    expect(greeting.color).toBe('#E53E3E');
    restoreDate();
  });

  test('should return "Good Night" for late night hours (22-4)', () => {
    const restoreDate = mockDate(23);
    const greeting = getTimeBasedGreetingEnglish();
    expect(greeting.text).toBe('Good Night');
    expect(greeting.icon).toBe('weather-night');
    expect(greeting.color).toBe('#9F7AEA');
    restoreDate();
  });
}); 
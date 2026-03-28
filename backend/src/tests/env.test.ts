describe('ENV', () => {
    it('should load DATABASE_URL', () => {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    expect(process.env.DATABASE_URL).toBeDefined();
    });
});
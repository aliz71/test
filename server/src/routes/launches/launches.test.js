/**
 * Supertest is built on top of the Jest library. 
 */
const request = require('supertest');
const app = require('../../app');
const mongoose = require('../../services/mongo');

/**
 * describ() and test() are functions in Jest
 */
describe('Launches Test API', () => {
    beforeAll(async () => {
        await mongoose.mongoConnect();
    });

    /**
     * We should close this connection after our test are completed.
     */
    afterAll(async () => {
        await mongoose.mongoDisconnect();
    });

    describe('Test Get /launches', () => {
        test('It should respond with 200 success', async () => {
            await request(app).get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200);
        });
    });
    
    describe('Test Post /launches', () => {
        const testData = {
            mission: "My mission",
            target: "Kepler-62 f",
            rocket: "My rocket",
            launchDate: "January 4, 2028"
        };
    
        const testDataWithInvalidDate = {
            mission: "My mission",
            target: "Kepler-62 f",
            rocket: "My rocket",
            launchDate: "Hello"
        };
    
        const testDataWithoutDate = {
            mission: "My mission",
            target: "Kepler-62 f",
            rocket: "My rocket"
        };
    
        test('It should respond with 201 created.', async () => {
            /**
             * these expect functions are for supertest
             */
            const response = await request(app)
            .post('/v1/launches')
            .send(testData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            requestDate = new Date(testData.launchDate);
            responseDate = new Date(response.body.launchDate);
    
            expect(requestDate).toStrictEqual(responseDate);
            expect(response.body).toMatchObject(testDataWithoutDate);
        });
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(testDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Some of your data is missing.'
            });
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(testDataWithInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Your date format is incorrect.'
            });
        });
    });    
});

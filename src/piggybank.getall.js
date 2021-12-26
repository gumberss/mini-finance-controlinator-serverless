const Joi = require('joi')

class Handler {
	constructor({ dynamoDbSvc }) {
		this.dynamoDbSvc = dynamoDbSvc
		this.dynamodbTable = process.env.PIGGY_BANKS_TABLE
	}

	static validator(){
		return Joi.object({
			nome: Joi.string().max(100).min(2).required(),
			poder: Joi.string().max(20).required()
		})
	}

	async getAll() {

        var params = {
            TableName: process.env.PIGGY_BANKS_TABLE,
            ProjectionExpression: "id, #n, savedValue, goalValue, goalDate, startDate",
            ExpressionAttributeNames: {'#n': 'name'}
        };

        var result = await this.dynamoDbSvc.scan(params).promise();

        return result.Items;
	}

	handelrSuccess(data) {
		return {
			statusCode: 200,
			body: JSON.stringify(data),
		}
	}

	handleError(data) {
		return {
			statusCode: data.statusCode || 501,
			headers: { 'Content-Type': 'text/plain' },
			body: "Couldn't get the items!!",
		}
	}

	async main(event) {
		try {
			return this.handelrSuccess(await this.getAll())
		} catch (err) {
			console.log('Oh no!', err.stack)
			this.handleError({ statusCode: 500 })
		}
	}
}

const AWS = require('aws-sdk') //npm i aws-sdk
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
	dynamoDbSvc: dynamoDB,
})

module.exports = handler.main.bind(handler)

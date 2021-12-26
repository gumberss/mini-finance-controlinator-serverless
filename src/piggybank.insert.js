const uuid = require('uuid')
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

	async insertItem(params) {
		return this.dynamoDbSvc.put(params).promise()
	}

	prepareData(data) {
		const params = {
			TableName: this.dynamodbTable,
			Item: {
				...data,
				id: uuid.v1(),
				createAt: new Date().toISOString(),
			},
		}

		return params
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
			body: "Couldn't create the item!!",
		}
	}

	async main(event) {
		try {
			const data = JSON.parse(event.body)
			const {error, value} = await Handler.validator().validate(data)
			
			const dbParams = this.prepareData(data)
			await this.insertItem(dbParams)
			return this.handelrSuccess(dbParams.Item)
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

const uuid = require('uuid')

class Handler {
	constructor({ dynamoDbSvc }) {
		this.dynamoDbSvc = dynamoDbSvc
		this.dynamodbTable = process.env.PIGGY_BANKS_TABLE
	}

	async deleteItem(params) {
		return this.dynamoDbSvc.delete(params).promise()
	}

	prepareData(data) {
		const params = {
            Key: { 'id' : data.id },
			TableName: this.dynamodbTable,
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
			body: "Couldn't delete the item!!",
		}
	}

	async main(event) {
		try {
			const data = JSON.parse(event.body)
            console.log(data);
			const dbParams = this.prepareData(data)
			var result = await this.deleteItem(dbParams)
            console.log(result);
			return this.handelrSuccess(dbParams.Item)
		} catch (err) {
			console.log('Oh no!', err.stack)
			return this.handleError({ statusCode: 500 })
		}
	}
}

const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
	dynamoDbSvc: dynamoDB,
})

module.exports = handler.main.bind(handler)

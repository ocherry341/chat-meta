
# Description
A web server for documents retrieving by ChatGPT. The service is built with [NestJS](https://nestjs.com/) and [OpenAI](https://platform.openai.com/) API. The vector database is powered by [Pinecone](https://www.pinecone.io/).


# Usage

## Environment Variables
> [OpenAI](https://platform.openai.com/) and [Pinecone](https://www.pinecone.io/) service are required to run the application. You can sign up for a free account and get the API keys.

Environment variables are Required to run the application. Set up env in the OS environment or create a `.env` file in the root directory of the project.
```bash
$ export OPENAI_API_KEY=sk-xxx
$ export PINECONE_API_KEY=xxx
```

All environment variables is listed below `.env` file:

```text
# OpenAI api
## check https://platform.openai.com/account/api-keys to get your api key
OPENAI_API_KEY=sk-xxx

# Pinecone api
## check https://www.pinecone.io/docs/quickstart/ for more information
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-west4-gcp
PINECONE_INDEX=your-index-name

# Optional
# OPENAI_API_BASE_URL=your-openai-api-proxy-url
# OPENAI_API_DEFAULT_MODEL=gpt-3.5-turbo # default is "gpt-3.5-turbo"
# PIENCONE_NAMESPACE=your-pinecone-namespace # default is "" 
# PORT=3000  # default port is 3000
# JWT_SECRET=your-jwt-secret # If set, the api will be protected by jwt
```

## Deployment

### Run with Node.js
```bash
$ npm install
$ npm run build
$ npm run start:prod
```

### Run with Docker
```bash
$ docker pull ocherry341/chat-meta:latest
# or build image from source
# $ docker build -t nest .
$ docker run -p 3000:3000 --env-file .env ocherry341/chat-meta
```

## API Endpoints

### `POST /insert`

Chunk a document and insert them into the vector database

__Request__
| Field      | Type                                    |          | Description                                                             |
| ---------- | --------------------------------------- | -------- | ----------------------------------------------------------------------- |
| text       | string                                  | Required | The text of the document                                                |
| [metadata] | string \| number \| boolean \| string[] | Optional | Any other metadata you want to store with the document, accepts any key |

__Example__
```json
{
    "text": "Some text to store in the database",
    "user": "User1",
    "title": "Document Title",
    "tags": ["tag1", "tag2"]
}
```

__Response__
| Field         | Type   | Description                                               |
| ------------- | ------ | --------------------------------------------------------- |
| upsertedCount | number | The number of chunked document inserted or updated        |
| failedCount   | number | The number of chunked document failed to insert or update |
| failedVectors | Array  | The failed vectors                                        |

__Example__
```json
{
    "upsertedCount": 1,
    "failedCount": 0,
    "failedVectors": []
}
```

### `POST /insert-file`

Upload a file, chunk it and insert them into the vector database. Following formats are supported:
- text/plain (.txt)
- application/pdf (.pdf)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)

__Request__

| Field      | Type                        |          | Description                                                             |
| ---------- | --------------------------- | -------- | ----------------------------------------------------------------------- |
| file       | file                        | Required | The uploaded file                                                       |
| [metadata] | string \| number \| boolean | Optional | Any other metadata you want to store with the document, accepts any key |

__Response__
| Field         | Type   | Description                                               |
| ------------- | ------ | --------------------------------------------------------- |
| upsertedCount | number | The number of chunked document inserted or updated        |
| failedCount   | number | The number of chunked document failed to insert or update |
| failedVectors | Array  | The failed vectors                                        |

`POST /query`

Query the vector database and return the most similar documents

__Request__

| Field  | Type   |          | Description                                                             |
| ------ | ------ | -------- | ----------------------------------------------------------------------- |
| text   | string | Required | The uploaded file                                                       |
| topK   | number | Optional | Any other metadata you want to store with the document, accepts any key |
| filter | object | Optional | [Metadata filter](https://docs.pinecone.io/docs/metadata-filtering)     |

__Response__
```json
{
    "results": [],
    "matches": [
        {
            "id": "MXNKIvY3irlofJ7XqDIML",
            "score": 0.867960095,
            "values": [],
            "metadata": {
                "text": "A text chunk from document, will be used to in chatgpt context",
                // any other metadata
                "author": "Robert",
                "source": "Technology Handbook",
                "tags": "[\"java\", \"python\", \"javascript\"]"
            }
        },
        ...
    ],
    "namespace": "your-namespace"
}
```

### `POST /remove`

__Request__

| Field     | Type    |          | Description                                                         |
| --------- | ------- | -------- | ------------------------------------------------------------------- |
| namespace | string  | Optional | namespace to remove, default same as env PIENCONE_NAMESPACE         |
| filter    | object  | Optional | [Metadata filter](https://docs.pinecone.io/docs/metadata-filtering) |
| deleteAll | boolean | Optional | If true, delete all documents in the namespace                      |

Note: Only one of `filter` and `deleteAll` must be provided.

__Response__

An empty object if success

### `POST /chat`

__Request__

| Field    | Type             |          | Description                                                                                                                                       |
| -------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| messages | Array\<Message\> | Required | namespace to remove, default same as env PIENCONE_NAMESPACE                                                                                       |
| filter   | object           | Optional | [Metadata filter](https://docs.pinecone.io/docs/metadata-filtering). if set, only filted document will be used as context.                        |
| model    | string           | Optional | Model used to generate text, default same as env OPENAI_API_DEFAULT_MODEL. See [list of models](https://platform.openai.com/docs/models/overview) |

```typescript
// Message interface
interface Message {
    content: string;
    role: 'system' | 'user' | 'assistant';
    name?: string;
}
```
__Response__

A Server Sent Event stream, with only `data` field contains a string of the generated text. Finish with `data: [DONE]`

## Authentication

If `JWT_SECRET` is set, the api will be protected by jwt. To access the api, you need to provide a jwt token in the `Authorization` header. 

Otherwise, the api is open to public.

>This service does not implement methods to generate jwt token. You need to use other services to generate jwt token with the same secret.

# Development

## Installation Dependencies

```bash
npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
## Note:
## Before running e2e tests, complie worker_thread .ts file 
## at src/modules/document/document-worker to .js by building the project into ./dist
# $ npm run build
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
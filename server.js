const express = require('express')
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull
} = require('graphql');
const app = express();

//Database samples
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// Create custom Author object type
const AuthorType = new GraphQLObjectType({
    name: 'author',
    description: 'Single author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

// Create custom Book object type
const BookType = new GraphQLObjectType({
    name: 'book',
    description: 'Single book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'Single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'Single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(authors)
                return author
            }
        },
        editBooks: {
            type: BookType,
            description: 'Edit Books',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const index = books.findIndex(book => book.id === args.id)
                books[index].name = args.name
                books[index].authorId = args.authorId
                return books[index]
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})

app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema
}))

app.listen(5000, () => console.log('Server is running...'))

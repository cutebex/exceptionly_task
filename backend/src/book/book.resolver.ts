import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { BookService } from './book.service'
import { CreateBookDTO } from './book.DTO'
import Book from './book.entity'
// import { GetUser, GqlAuthGuard } from './user.decorator'

@Resolver()
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  getBook(@Args('userId') userId: string) {
    return this.bookService.findByUserId(userId)
  }

  @Mutation(() => Book)
  createBooking(@Args('createBookDTO') createBookDTO: CreateBookDTO) {
    console.log('here: ', createBookDTO)
    return this.bookService.create(createBookDTO)
  }
}

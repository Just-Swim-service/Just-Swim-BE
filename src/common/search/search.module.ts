import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ResponseService } from '../response/response.service';

@Global() // SearchService를 전역으로 사용 가능하게 설정
@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SearchController],
  providers: [SearchService, ResponseService],
  exports: [SearchService],
})
export class SearchModule {}

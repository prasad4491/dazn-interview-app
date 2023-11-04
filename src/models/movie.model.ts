import {Schema, Document, model} from 'mongoose';

interface Movie {
  title: string
  genere: string
  streamingLink: string
  rating: number
}

export interface MovieModel extends Movie, Document {}

export const movieSchema = new Schema<MovieModel>({
  title: {type: String, required: true},
  genere: {type: String, required: true},
  streamingLink: {type: String, required: true},
  rating: {type: Number, required: true}
})

export default model<MovieModel>('Movie', movieSchema);
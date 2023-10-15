import * as z from 'zod'

export const apiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      geometry: z.object({
        type: z.literal('Point'),
        coordinates: z.array(z.number()),
      }),
      camera_type: z.enum(['perspective', 'fisheye', 'equirectangular', 'spherical']).optional(),
      captured_at: z.number(),
      sequence: z.string(),
    }),
  ),
})

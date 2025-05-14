export const ADMINS_COUNT = 2
export const AUTHORS_COUNT = 30
export const BOOK_TAGS_COUNT = 20
export const BOOKS_COUNT = 100
export const GENRES_COUNT = 20
export const TEAMS_COUNT = 10
export const USERS_COUNT = 50

export function random(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function randomAuthorId() {
  return random(1, AUTHORS_COUNT)
}

export function randomBookTagId() {
  return random(1, BOOK_TAGS_COUNT)
}

export function randomContent(part, maxCount) {
  const count = random(1, maxCount)
  const parts = []

  for (let i = 0; i < count; i++) parts.push(part)

  return parts.join('. ')
}

export function randomGenreId() {
  return random(1, GENRES_COUNT)
}

export function randomUserId() {
  return random(ADMINS_COUNT + 1, USERS_COUNT)
}

// DUMMY
export async function seed(knex) {

}

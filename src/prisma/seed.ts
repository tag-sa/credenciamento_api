import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const teamsStatus = [{ id: 1, name: 'Ativo' }]

const teamsUsersStatus = [
  { id: 1, name: 'Aguardando' },
  { id: 2, name: 'Confirmado' },
  { id: 3, name: 'Recusado' }
]

const functions = [
  { id: 1, name: 'Segurança' },
  { id: 2, name: 'Supervisor' },
  { id: 3, name: 'Bombeiro' },
  { id: 4, name: 'Recepcionista' },
  { id: 5, name: 'Manobrista' }
]

const notifications = [{ id: 1, name: 'Notificações de vagas' }]

const coursesTypes = [
  { id: 1, name: 'Curso' },
  { id: 2, name: 'Treinamento' },
  { id: 3, name: 'Palestra' },
  { id: 4, name: 'Workshop' },
  { id: 5, name: 'Conferência' }
]

const usersCoursesStatus = [
  { id: 1, name: 'Em análise', hasOpacity: true, icon: 'IconCourseAwaiting' },
  { id: 2, name: 'Aprovado', hasOpacity: false, icon: null },
  { id: 3, name: 'Reprovado', hasOpacity: true, icon: null }
]

async function main() {
  for (const status of teamsStatus) {
    await prisma.teamsStatus.create({
      data: status
    })
  }

  for (const func of functions) {
    await prisma.functions.create({
      data: func
    })
  }

  for (const notif of notifications) {
    await prisma.notificationsTypes.create({
      data: notif
    })
  }

  for (const courseType of coursesTypes) {
    await prisma.coursesTypes.create({
      data: courseType
    })
  }

  for (const userCourseStatus of usersCoursesStatus) {
    await prisma.usersCoursesStatus.create({
      data: userCourseStatus
    })
  }

  for (const teamUserStatus of teamsUsersStatus) {
    await prisma.teamsUsersStatus.create({
      data: teamUserStatus
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const teamsStatus = [{ id: 1, name: 'Ativo' }]

const functions = [
  { id: 1, name: 'Segurança' },
  { id: 2, name: 'Supervisor' },
  { id: 3, name: 'Bombeiro' },
  { id: 4, name: 'Recepcionista' },
  { id: 5, name: 'Manobrista' }
]

const notifications = [{ id: 1, name: 'Notificações de vagas' }]

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Lock } from 'lucide-react'
import { ShineBorder } from '~/components/magicui/shine-border'

type ZonaRojaCardProps = {
  title: string
  description: string
  isLocked?: boolean
  onClick?: () => void
}

export function ZonaRojaCard({ title, description, isLocked = false, onClick }: ZonaRojaCardProps) {
  return (
    <Card className={`flex flex-col relative overflow-hidden ${isLocked ? 'bg-slate-50 opacity-75' : 'bg-white'}`}>
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
      <CardHeader className="flex-grow">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {isLocked && <Lock className="h-5 w-5 text-slate-500" />}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="pt-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" onClick={onClick}>
          {isLocked ? 'Disponible en Premium' : 'Empezar a Estudiar'}
        </Button>
      </CardFooter>
    </Card>
  )
} 
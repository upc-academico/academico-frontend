import { Curso } from "./Curso"

export class Competencia{
    idCompetencia:number=0
    nombreCompetencia:String=""
    enabled:Boolean=false
    curso:Curso=new Curso()
}
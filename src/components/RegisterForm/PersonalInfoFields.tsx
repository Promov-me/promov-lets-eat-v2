
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./schema";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo*</FormLabel>
            <FormControl>
              <Input placeholder="Digite seu nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gênero*</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail*</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu e-mail" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone*</FormLabel>
              <FormControl>
                <MaskedInput 
                  mask="(99) 99999-9999" 
                  placeholder="(00) 00000-0000" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="documento"
        render={({ field }) => {
          const isCPF = field.value.length <= 11;
          const mask = isCPF ? "999.999.999-99" : "99.999.999/9999-99";
          
          return (
            <FormItem>
              <FormLabel>CPF/CNPJ*</FormLabel>
              <FormControl>
                <MaskedInput 
                  mask={mask}
                  maskChar={null}
                  placeholder="Digite seu CPF ou CNPJ" 
                  {...field}
                  onChange={(e) => {
                    // Remove non-digit characters before saving value
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP*</FormLabel>
            <FormControl>
              <MaskedInput 
                mask="99999-999"
                placeholder="00000-000"
                {...field}
                onChange={(e) => {
                  // Remove non-digit characters before saving value
                  const value = e.target.value.replace(/\D/g, '');
                  field.onChange(value);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  const cep = e.target.value.replace(/\D/g, '');
                  if (cep.length === 8) {
                    fetch(`https://viacep.com.br/ws/${cep}/json/`)
                      .then(res => res.json())
                      .then(data => {
                        if (!data.erro) {
                          form.setValue('rua', data.logradouro || '');
                          form.setValue('bairro', data.bairro || '');
                          form.setValue('cidade', data.localidade || '');
                          form.setValue('uf', data.uf || '');
                        }
                      })
                      .catch(error => console.error("Erro ao buscar CEP:", error));
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfoFields;
